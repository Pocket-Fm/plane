# Python imports
import requests

# Django imports
from django.conf import settings
from django.utils import timezone

# Module imports
from plane.db.models import Workspace, WorkspaceMember
from plane.ee.models import WorkspaceLicense


def fetch_workspace_license(workspace_id, workspace_slug, free_seats=12):

    # If the number of free seats is less than 12, set it to 12
    workspace_free_seats = 12 if free_seats <= 12 else free_seats

    response = requests.post(
        f"{settings.PAYMENT_SERVER_BASE_URL}/api/products/workspace-products/{str(workspace_id)}/",
        headers={
            "content-type": "application/json",
            "x-api-key": settings.PAYMENT_SERVER_AUTH_TOKEN,
        },
        json={
            "workspace_slug": str(workspace_slug),
            "free_seats": workspace_free_seats,
        },
    )
    response.raise_for_status()
    response = response.json()
    return response


def resync_workspace_license(workspace_slug, force=False):
    # Fetch the workspace
    workspace = Workspace.objects.get(slug=workspace_slug)

    # Check if the license is present for the workspace
    workspace_license = WorkspaceLicense.objects.filter(
        workspace=workspace
    ).first()

    # If the license is present, then check if the last sync is more than 1 hour
    if workspace_license:
        # If the last sync is more than 1 hour, then sync the license or if force is True
        if (
            workspace_license.last_synced_at - timezone.now()
        ).total_seconds() > 3600 or force:

            # Fetch the workspace license
            response = fetch_workspace_license(
                workspace_id=str(workspace.id),
                workspace_slug=workspace_slug,
                free_seats=WorkspaceMember.objects.filter(
                    is_active=True,
                    workspace__slug=workspace_slug,
                    member__is_bot=False,
                ).count(),
            )
            # Update the last synced time
            workspace_license.last_synced_at = timezone.now()
            workspace_license.is_cancelled = response.get(
                "is_cancelled", False
            )
            workspace_license.free_seats = response.get("free_seats", 12)
            workspace_license.purchased_seats = response.get(
                "purchased_seats", 0
            )
            workspace_license.current_period_end_date = response.get(
                "current_period_end_date"
            )
            workspace_license.recurring_interval = response.get("interval")
            workspace_license.plan = response.get("plan")
            workspace_license.is_offline_payment = response.get(
                "is_offline_payment", False
            )
            workspace_license.trial_end_date = response.get("trial_end_date")
            workspace_license.has_activated_free_trial = response.get(
                "has_activated_free_trial", False
            )
            workspace_license.has_added_payment_method = response.get(
                "has_added_payment_method", False
            )
            workspace_license.subscription = response.get("subscription")
            workspace_license.save()
            return {
                "is_cancelled": workspace_license.is_cancelled,
                "purchased_seats": workspace_license.purchased_seats,
                "current_period_end_date": workspace_license.current_period_end_date,
                "interval": workspace_license.recurring_interval,
                "product": workspace_license.plan,
                "is_offline_payment": workspace_license.is_offline_payment,
                "trial_end_date": workspace_license.trial_end_date,
                "has_activated_free_trial": workspace_license.has_activated_free_trial,
                "has_added_payment_method": workspace_license.has_added_payment_method,
                "subscription": workspace_license.subscription,
            }
        else:
            return {
                "is_cancelled": workspace_license.is_cancelled,
                "purchased_seats": workspace_license.purchased_seats,
                "current_period_end_date": workspace_license.current_period_end_date,
                "interval": workspace_license.recurring_interval,
                "product": workspace_license.plan,
                "is_offline_payment": workspace_license.is_offline_payment,
                "trial_end_date": workspace_license.trial_end_date,
                "has_activated_free_trial": workspace_license.has_activated_free_trial,
                "has_added_payment_method": workspace_license.has_added_payment_method,
                "subscription": workspace_license.subscription,
            }
    # If the license is not present, then fetch the license from the payment server and create it
    else:
        # Fetch the workspace license
        response = fetch_workspace_license(
            workspace_id=str(workspace.id),
            workspace_slug=workspace_slug,
            free_seats=WorkspaceMember.objects.filter(
                is_active=True,
                workspace__slug=workspace_slug,
                member__is_bot=False,
            ).count(),
        )
        # Create the workspace license
        workspace_license = WorkspaceLicense.objects.create(
            workspace=workspace,
            is_cancelled=response.get("is_cancelled", False),
            purchased_seats=response.get("purchased_seats", 0),
            free_seats=response.get("free_seats", 12),
            current_period_end_date=response.get("current_period_end_date"),
            recurring_interval=response.get("interval"),
            plan=response.get("plan"),
            last_synced_at=timezone.now(),
            trial_end_date=response.get("trial_end_date"),
            has_activated_free_trial=response.get(
                "has_activated_free_trial", False
            ),
            has_added_payment_method=response.get(
                "has_added_payment_method", False
            ),
            subscription=response.get("subscription"),
        )
        # Return the workspace license
        return {
            "is_cancelled": workspace_license.is_cancelled,
            "purchased_seats": workspace_license.purchased_seats,
            "current_period_end_date": workspace_license.current_period_end_date,
            "interval": workspace_license.recurring_interval,
            "product": workspace_license.plan,
            "is_offline_payment": workspace_license.is_offline_payment,
            "trial_end_date": workspace_license.trial_end_date,
            "has_activated_free_trial": workspace_license.has_activated_free_trial,
            "has_added_payment_method": workspace_license.has_added_payment_method,
            "subscription": workspace_license.subscription,
        }
