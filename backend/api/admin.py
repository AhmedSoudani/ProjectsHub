from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Project, Task
# Register your models here.


class CustomUserAdmin(UserAdmin):
    # UserAdmin hashes passwords; the plain ModelAdmin stored them as raw text.
    fieldsets = UserAdmin.fieldsets + (("Role", {"fields": ("role",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Role", {"fields": ("role",)}),)
    list_display = UserAdmin.list_display + ("role",)


admin.site.register(User, CustomUserAdmin)
admin.site.register(Project)
admin.site.register(Task)
