from django.shortcuts import get_object_or_404
from rest_framework import generics
from django.db.models import Q
from .serializers import RegisterSerializer, UserSerializer, ProjectSerializer, TaskSerializer
from .models import Project, Task, User
from .permissions import IsProjectOwner, IsOwnerOrAdminOrReadOnly, is_admin
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied


def visible_projects(user):
    
    if is_admin(user):
        return Project.objects.all()
    return Project.objects.filter(
        Q(owner=user) |
        Q(tasks__assigned_to=user)
    ).distinct()


# Create your views here.
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.order_by("username")

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return visible_projects(self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdminOrReadOnly]
    lookup_url_kwarg = "project_id"

    def get_queryset(self):
        return visible_projects(self.request.user)

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        project = get_object_or_404(
            visible_projects(self.request.user), pk=self.kwargs["project_id"]
        )
        return project.tasks.order_by("created_at")

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsProjectOwner()]
        else:
            return[IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(project_id=self.kwargs["project_id"])

class TaskUpdate(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        task = get_object_or_404(
            Task,
            id=self.kwargs["task_id"],
            project_id=self.kwargs["project_id"]
        )

        user = self.request.user

        if user.role != "admin" and task.project.owner != user:
            raise PermissionDenied(
                "Only the project owner or an admin can update this task."
            )

        return task
