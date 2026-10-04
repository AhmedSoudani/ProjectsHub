from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('', views.ProjectListCreateView.as_view(), name='projects'),

    path(
        'project/<int:project_id>/',
        views.ProjectDetailView.as_view(),
        name='project'
    ),

    path(
        'project/<int:project_id>/tasks/',
        views.TaskListCreateView.as_view(),
        name='project-tasks'
    ),

    path(
        'project/<int:project_id>/tasks/<int:task_id>/',
        views.TaskUpdate.as_view(),
        name='task'
    ),

    path('register/', views.RegisterView.as_view(), name='register'),

    path('me/', views.MeView.as_view(), name='me'),

    path('users/', views.UserListView.as_view(), name='users'),

    path(
        'token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),
]
