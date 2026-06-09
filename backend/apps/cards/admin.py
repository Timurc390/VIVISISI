from django.contrib import admin
from .models import Card, CardProject


class CardProjectInline(admin.TabularInline):
    model = CardProject
    extra = 0


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ["full_name", "role", "owner", "theme", "layout", "is_public", "views_count", "created_at"]
    list_filter = ["theme", "layout", "is_public"]
    search_fields = ["full_name", "role", "owner__email"]
    inlines = [CardProjectInline]
    readonly_fields = ["slug", "views_count", "generated_html"]
