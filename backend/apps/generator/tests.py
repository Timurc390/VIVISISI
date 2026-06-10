from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from apps.cards.models import Card, CardProject


class GenerateCardViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User = get_user_model()
        self.user = User.objects.create_user(
            email="test@example.com",
            password="secret123",
            first_name="Test",
            last_name="User",
        )
        self.card = Card.objects.create(
            owner=self.user,
            full_name="Іван Петренко",
            role="Frontend Developer",
            bio="Створюю сучасні сайти-візитки.",
            email="ivan@example.com",
            phone="+380501234567",
            city="Київ",
            github="https://github.com/ivan",
            telegram="@ivan",
            linkedin="https://linkedin.com/in/ivan",
            skills=["React", "Django"],
            theme="dark-neon",
            layout="hero",
            sphere="developer",
        )

    @override_settings(ANTHROPIC_API_KEY="")
    def test_generate_uses_fallback_html_when_api_key_is_missing(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse("generate-card", kwargs={"card_id": self.card.pk})
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("generated_html", body)
        self.assertIn("<!DOCTYPE html>", body["generated_html"])
        self.assertIn("Іван Петренко", body["generated_html"])

    @override_settings(ANTHROPIC_API_KEY="")
    def test_fallback_html_uses_selected_layout_variant(self):
        self.client.force_authenticate(self.user)
        self.card.layout = "sidebar"
        self.card.save(update_fields=["layout"])

        response = self.client.post(
            reverse("generate-card", kwargs={"card_id": self.card.pk})
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("layout-sidebar", body["generated_html"])

    @override_settings(ANTHROPIC_API_KEY="")
    def test_generated_fallback_html_includes_uploaded_project_image(self):
        self.client.force_authenticate(self.user)
        CardProject.objects.create(
            card=self.card,
            name="Портфоліо",
            description="Дизайн",
            link_label="Переглянути",
            link_url="https://example.com",
            bg_image=SimpleUploadedFile(
                "project.png",
                b"fake-image-data",
                content_type="image/png",
            ),
        )

        response = self.client.post(
            reverse("generate-card", kwargs={"card_id": self.card.pk})
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("/media/projects/", body["generated_html"])
