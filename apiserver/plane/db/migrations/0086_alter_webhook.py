# Generated by Django 4.2.15 on 2024-11-18 07:56

from django.db import migrations, models
import plane.db.models.webhook
from django.conf import settings
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        (
            "db",
            "0085_intake_intakeissue_remove_inboxissue_created_by_and_more",
        ),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name="teammember",
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name="teammember",
            name="created_by",
        ),
        migrations.RemoveField(
            model_name="teammember",
            name="member",
        ),
        migrations.RemoveField(
            model_name="teammember",
            name="team",
        ),
        migrations.RemoveField(
            model_name="teammember",
            name="updated_by",
        ),
        migrations.RemoveField(
            model_name="teammember",
            name="workspace",
        ),
        migrations.AlterUniqueTogether(
            name="teampage",
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name="teampage",
            name="created_by",
        ),
        migrations.RemoveField(
            model_name="teampage",
            name="page",
        ),
        migrations.RemoveField(
            model_name="teampage",
            name="team",
        ),
        migrations.RemoveField(
            model_name="teampage",
            name="updated_by",
        ),
        migrations.RemoveField(
            model_name="teampage",
            name="workspace",
        ),
        migrations.RemoveField(
            model_name="page",
            name="teams",
        ),
        migrations.AlterField(
            model_name="webhook",
            name="url",
            field=models.URLField(
                max_length=1024,
                validators=[
                    plane.db.models.webhook.validate_schema,
                    plane.db.models.webhook.validate_domain,
                ],
            ),
        ),
        migrations.DeleteModel(
            name="Team",
        ),
        migrations.DeleteModel(
            name="TeamMember",
        ),
        migrations.DeleteModel(
            name="TeamPage",
        ),
        migrations.CreateModel(
            name="IssueVersion",
            fields=[
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True, verbose_name="Created At"
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True, verbose_name="Last Modified At"
                    ),
                ),
                (
                    "deleted_at",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="Deleted At"
                    ),
                ),
                (
                    "id",
                    models.UUIDField(
                        db_index=True,
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                        unique=True,
                    ),
                ),
                ("parent", models.UUIDField(blank=True, null=True)),
                ("state", models.UUIDField(blank=True, null=True)),
                ("estimate_point", models.UUIDField(blank=True, null=True)),
                (
                    "name",
                    models.CharField(
                        max_length=255, verbose_name="Issue Name"
                    ),
                ),
                ("description", models.JSONField(blank=True, default=dict)),
                (
                    "description_html",
                    models.TextField(blank=True, default="<p></p>"),
                ),
                (
                    "description_stripped",
                    models.TextField(blank=True, null=True),
                ),
                ("description_binary", models.BinaryField(null=True)),
                (
                    "priority",
                    models.CharField(
                        choices=[
                            ("urgent", "Urgent"),
                            ("high", "High"),
                            ("medium", "Medium"),
                            ("low", "Low"),
                            ("none", "None"),
                        ],
                        default="none",
                        max_length=30,
                        verbose_name="Issue Priority",
                    ),
                ),
                ("start_date", models.DateField(blank=True, null=True)),
                ("target_date", models.DateField(blank=True, null=True)),
                (
                    "sequence_id",
                    models.IntegerField(
                        default=1, verbose_name="Issue Sequence ID"
                    ),
                ),
                ("sort_order", models.FloatField(default=65535)),
                ("completed_at", models.DateTimeField(null=True)),
                ("archived_at", models.DateField(null=True)),
                ("is_draft", models.BooleanField(default=False)),
                (
                    "external_source",
                    models.CharField(blank=True, max_length=255, null=True),
                ),
                (
                    "external_id",
                    models.CharField(blank=True, max_length=255, null=True),
                ),
                ("type", models.UUIDField(blank=True, null=True)),
                (
                    "last_saved_at",
                    models.DateTimeField(default=django.utils.timezone.now),
                ),
                ("owned_by", models.UUIDField()),
                (
                    "assignees",
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.UUIDField(),
                        blank=True,
                        default=list,
                        size=None,
                    ),
                ),
                (
                    "labels",
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.UUIDField(),
                        blank=True,
                        default=list,
                        size=None,
                    ),
                ),
                ("cycle", models.UUIDField(blank=True, null=True)),
                (
                    "modules",
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.UUIDField(),
                        blank=True,
                        default=list,
                        size=None,
                    ),
                ),
                ("properties", models.JSONField(default=dict)),
                ("meta", models.JSONField(default=dict)),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(class)s_created_by",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Created By",
                    ),
                ),
                (
                    "issue",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="versions",
                        to="db.issue",
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="project_%(class)s",
                        to="db.project",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(class)s_updated_by",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Last Modified By",
                    ),
                ),
                (
                    "workspace",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="workspace_%(class)s",
                        to="db.workspace",
                    ),
                ),
            ],
            options={
                "verbose_name": "Issue Version",
                "verbose_name_plural": "Issue Versions",
                "db_table": "issue_versions",
                "ordering": ("-created_at",),
            },
        ),
    ]
