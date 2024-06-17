# Python imports
import json
import base64
from datetime import datetime
from django.core.serializers.json import DjangoJSONEncoder

# Django imports
from django.db import connection
from django.db.models import Exists, OuterRef, Q
from django.http import StreamingHttpResponse

# Third party imports
from rest_framework import status
from rest_framework.response import Response


# Module imports
from plane.app.permissions import WorkspaceEntityPermission
from plane.app.serializers import (
    WorkspacePageSerializer,
    PageDetailSerializer,
    WorkspacePageDetailSerializer,
)
from plane.db.models import (
    Page,
    UserFavorite,
    ProjectMember,
    Workspace,
)

from ..base import BaseViewSet

from plane.bgtasks.page_transaction_task import page_transaction


def unarchive_archive_page_and_descendants(page_id, archived_at):
    # Your SQL query
    sql = """
    WITH RECURSIVE descendants AS (
        SELECT id FROM pages WHERE id = %s
        UNION ALL
        SELECT pages.id FROM pages, descendants WHERE pages.parent_id = descendants.id
    )
    UPDATE pages SET archived_at = %s WHERE id IN (SELECT id FROM descendants);
    """

    # Execute the SQL query
    with connection.cursor() as cursor:
        cursor.execute(sql, [page_id, archived_at])


class WorkspacePageViewSet(BaseViewSet):
    serializer_class = WorkspacePageSerializer
    model = Page
    permission_classes = [
        WorkspaceEntityPermission,
    ]
    search_fields = [
        "name",
    ]

    def get_queryset(self):
        subquery = UserFavorite.objects.filter(
            user=self.request.user,
            entity_type="page",
            entity_identifier=OuterRef("pk"),
            workspace__slug=self.kwargs.get("slug"),
        )
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(is_global=True)
            .filter(parent__isnull=True)
            .filter(Q(owned_by=self.request.user) | Q(access=0))
            .prefetch_related("projects")
            .select_related("workspace")
            .select_related("owned_by")
            .annotate(is_favorite=Exists(subquery))
            .order_by(self.request.GET.get("order_by", "-created_at"))
            .prefetch_related("labels")
            .order_by("-is_favorite", "-created_at")
            .distinct()
        )

    def create(self, request, slug):
        workspace = Workspace.objects.get(slug=slug)
        serializer = WorkspacePageSerializer(
            data=request.data,
            context={
                "owned_by_id": request.user.id,
                "description_html": request.data.get(
                    "description_html", "<p></p>"
                ),
                "workspace_id": workspace.id,
            },
        )

        if serializer.is_valid():
            serializer.save(is_global=True)
            # capture the page transaction
            page_transaction.delay(request.data, None, serializer.data["id"])
            page = Page.objects.get(pk=serializer.data["id"])
            serializer = PageDetailSerializer(page)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, slug, pk):
        try:
            page = Page.objects.get(
                pk=pk,
                workspace__slug=slug,
            )

            if page.is_locked:
                return Response(
                    {"error": "Page is locked"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            parent = request.data.get("parent", None)
            if parent:
                _ = Page.objects.get(
                    pk=parent,
                    workspace__slug=slug,
                )

            # Only update access if the page owner is the requesting  user
            if (
                page.access != request.data.get("access", page.access)
                and page.owned_by_id != request.user.id
            ):
                return Response(
                    {
                        "error": "Access cannot be updated since this page is owned by someone else"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = PageDetailSerializer(
                page, data=request.data, partial=True
            )
            page_description = page.description_html
            if serializer.is_valid():
                serializer.save()
                # capture the page transaction
                if request.data.get("description_html"):
                    page_transaction.delay(
                        new_value=request.data,
                        old_value=json.dumps(
                            {
                                "description_html": page_description,
                            },
                            cls=DjangoJSONEncoder,
                        ),
                        page_id=pk,
                    )

                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        except Page.DoesNotExist:
            return Response(
                {
                    "error": "Access cannot be updated since this page is owned by someone else"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    def retrieve(self, request, slug, pk=None):
        page = self.get_queryset().filter(pk=pk).first()
        if page is None:
            return Response(
                {"error": "Page not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        else:
            return Response(
                WorkspacePageDetailSerializer(page).data,
                status=status.HTTP_200_OK,
            )

    def lock(self, request, slug, pk):
        page = Page.objects.filter(
            pk=pk,
            workspace__slug=slug,
        ).first()

        page.is_locked = True
        page.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def unlock(self, request, slug, pk):
        page = Page.objects.filter(
            pk=pk,
            workspace__slug=slug,
        ).first()

        page.is_locked = False
        page.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

    def list(self, request, slug):
        queryset = self.get_queryset()
        pages = WorkspacePageSerializer(queryset, many=True).data
        return Response(pages, status=status.HTTP_200_OK)

    def archive(self, request, slug, pk):
        page = Page.objects.get(
            pk=pk,
            workspace__slug=slug,
        )

        # only the owner or admin can archive the page
        if (
            ProjectMember.objects.filter(
                member=request.user,
                is_active=True,
                role__lte=15,
            ).exists()
            and request.user.id != page.owned_by_id
        ):
            return Response(
                {"error": "Only the owner or admin can archive the page"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        unarchive_archive_page_and_descendants(pk, datetime.now())

        return Response(
            {"archived_at": str(datetime.now())},
            status=status.HTTP_200_OK,
        )

    def unarchive(self, request, slug, pk):
        page = Page.objects.get(
            pk=pk,
            workspace__slug=slug,
        )

        # only the owner or admin can un archive the page
        if (
            ProjectMember.objects.filter(
                member=request.user,
                is_active=True,
                role__lte=15,
            ).exists()
            and request.user.id != page.owned_by_id
        ):
            return Response(
                {"error": "Only the owner or admin can un archive the page"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # if parent page is archived then the page will be un archived breaking the hierarchy
        if page.parent_id and page.parent.archived_at:
            page.parent = None
            page.save(update_fields=["parent"])

        unarchive_archive_page_and_descendants(pk, None)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def destroy(self, request, slug, pk):
        page = Page.objects.get(
            pk=pk,
            workspace__slug=slug,
        )

        # only the owner and admin can delete the page
        if (
            ProjectMember.objects.filter(
                member=request.user,
                is_active=True,
                role__gt=20,
            ).exists()
            or request.user.id != page.owned_by_id
        ):
            return Response(
                {"error": "Only the owner and admin can delete the page"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if page.archived_at is None:
            return Response(
                {"error": "The page should be archived before deleting"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # remove parent from all the children
        _ = Page.objects.filter(parent_id=pk, workspace__slug=slug).update(
            parent=None
        )

        page.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WorkspacePagesDescriptionViewSet(BaseViewSet):
    permission_classes = [
        WorkspaceEntityPermission,
    ]

    def retrieve(self, request, slug, pk):
        page = Page.objects.get(
            pk=pk,
            workspace__slug=slug,
        )
        binary_data = page.description_binary

        def stream_data():
            if binary_data:
                yield binary_data
            else:
                yield b""

        response = StreamingHttpResponse(
            stream_data(), content_type="application/octet-stream"
        )
        response["Content-Disposition"] = (
            'attachment; filename="page_description.bin"'
        )
        return response

    def partial_update(self, request, slug, pk):
        page = Page.objects.get(
            pk=pk,
            workspace__slug=slug,
        )

        base64_data = request.data.get("description_binary")

        if base64_data:
            # Decode the base64 data to bytes
            new_binary_data = base64.b64decode(base64_data)

            # Store the updated binary data
            page.description_binary = new_binary_data
            page.description_html = request.data.get("description_html")
            page.save()
            return Response({"message": "Updated successfully"})
        else:
            return Response({"error": "No binary data provided"})
