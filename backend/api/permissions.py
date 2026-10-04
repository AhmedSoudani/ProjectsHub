from django.shortcuts import get_object_or_404
from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Project


def is_admin(user):
    return user.is_authenticated and user.role == "admin"


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)


class IsProjectOwner(BasePermission):
    """Allows access to the project in the URL (project_id) only to its owner or an admin."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        project = get_object_or_404(Project, pk=view.kwargs["project_id"])
        return is_admin(request.user) or project.owner == request.user


class IsOwnerOrAdminOrReadOnly(BasePermission):
    """Object-level: anyone who can see the project may read it, only the owner or an admin may change it."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return is_admin(request.user) or obj.owner == request.user
