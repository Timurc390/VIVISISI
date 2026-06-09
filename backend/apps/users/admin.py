from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "first_name", "last_name", "language", "is_staff", "created_at"]
    list_filter = ["is_staff", "is_superuser", "language"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["-created_at"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Особисті дані", {"fields": ("first_name", "last_name", "avatar", "language")}),
        ("Права доступу", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Дати", {"fields": ("last_login", "created_at")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
    )
    readonly_fields = ["created_at"]
