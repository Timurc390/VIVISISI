from rest_framework import serializers
from .models import Card, CardProject
import uuid


class CardProjectSerializer(serializers.ModelSerializer):
    bg_image_url = serializers.SerializerMethodField()

    class Meta:
        model = CardProject
        fields = [
            "id", "name", "description",
            "link_label", "link_url",
            "bg_image", "bg_image_url", "order",
        ]
        extra_kwargs = {"bg_image": {"write_only": True}}

    def get_bg_image_url(self, obj):
        request = self.context.get("request")
        if obj.bg_image and request:
            return request.build_absolute_uri(obj.bg_image.url)
        return None


class CardSerializer(serializers.ModelSerializer):
    projects = CardProjectSerializer(many=True, read_only=True)
    owner_name = serializers.ReadOnlyField(source="owner.full_name")

    class Meta:
        model = Card
        fields = [
            "id", "slug", "owner_name",
            "full_name", "role", "bio",
            "email", "phone", "city", "github", "telegram", "linkedin",
            "skills", "theme", "layout", "sphere",
            "generated_html", "is_public", "views_count",
            "projects", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "generated_html", "views_count", "created_at", "updated_at", "owner_name"]

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        validated_data["slug"] = str(uuid.uuid4())[:8]
        return super().create(validated_data)


class CardPublicSerializer(serializers.ModelSerializer):
    """Публічна візитка — без sensitive даних власника"""
    projects = CardProjectSerializer(many=True, read_only=True)

    class Meta:
        model = Card
        fields = [
            "id", "slug", "full_name", "role", "bio",
            "email", "phone", "city", "github", "telegram", "linkedin",
            "skills", "theme", "layout",
            "generated_html", "views_count",
            "projects", "created_at",
        ]
