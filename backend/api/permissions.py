from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return(request.user.is_authenticated and
          request.user.role == "admin" 
        )

class IsProjectOwner(BasePermission):
    def has_permission(self, request, view, obj):
        return (request.user.is_authenticated and
                obj.owner == request.user)