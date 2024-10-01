# Python imports
from functools import wraps
from enum import Enum

# Django imports

# Third party imports
import openfeature.api
from openfeature.evaluation_context import EvaluationContext

from rest_framework import status
from rest_framework.response import Response

# Module imports
from .provider import FlagProvider


class ErrorCodes(Enum):
    PAYMENT_REQUIRED = 1999


def check_feature_flag(feature_key, default_value=False):
    """decorator to feature flag"""

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(instance, request, *args, **kwargs):
            # Function to generate cache key
            openfeature.api.set_provider(FlagProvider())
            client = openfeature.api.get_client()
            if client.get_boolean_value(
                flag_key=feature_key.value,
                default_value=default_value,
                evaluation_context=EvaluationContext(
                    str(request.user.id),
                    {"slug": kwargs.get("slug")},
                ),
            ):
                response = view_func(instance, request, *args, **kwargs)
            else:
                response = Response(
                    {
                        "error": "Payment required",
                        "error_code": ErrorCodes.PAYMENT_REQUIRED.value,
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )
            return response

        return _wrapped_view

    return decorator


def check_workspace_feature_flag(
    feature_key, slug, user_id=None, default_value=False
):
    """Function to check workspace feature flag"""
    # Function to generate cache key
    openfeature.api.set_provider(FlagProvider())
    client = openfeature.api.get_client()

    # Function to check if the feature flag is enabled
    flag = client.get_boolean_value(
        flag_key=feature_key.value,
        default_value=default_value,
        evaluation_context=EvaluationContext(
            user_id,
            {"slug": slug},
        ),
    )
    # Return the flag
    return flag
