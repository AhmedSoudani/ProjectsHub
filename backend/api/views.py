from django.shortcuts import render
from rest_framework import generics, status 
from rest_framework.views import APIView
from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer, ProjectSerializer, TaskSerializer
from .models import Project, Task, User
from .permissions import IsProjectOwner
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

# Create your views here.
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        if(self.request.user.is_authenticated and
            self.request.user.role == "admin"   
        ):
            return Project.objects.all()
        elif (self.request.user.is_authenticated):
            return Project.objects.filter(
                Q(owner=self.request.user) |
                Q(tasks__assigned_to=self.request.user)
            ).distinct()
    
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        else:
            return [IsAuthenticated()]
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(project_id=self.kwargs["project_id"])

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsProjectOwner()]
        else:
            return[IsAuthenticated()]

class TaskUpdate(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        task = Task.objects.get(
            id=self.kwargs["task_id"],
            project_id=self.kwargs["project_id"]
        )

        user = self.request.user

        if user.role != "admin" and task.project.owner != user:
            raise PermissionDenied(
                "Only the project owner or an admin can update this task."
            )

        return task