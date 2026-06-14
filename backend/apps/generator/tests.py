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

    @override_settings(ANTHROPIC_API_KEY="")
    def test_fallback_html_renders_media_map_video_and_custom_socials(self):
        self.client.force_authenticate(self.user)
        self.card.design_settings = {
            "enabled_blocks": ["gallery", "video", "map", "contacts"],
            "section_order": ["gallery", "video", "map", "contacts"],
            "primary_link_label": "Записатися",
            "primary_link_url": "example.com/book",
            "social_links": [
                {"platform": "Instagram", "label": "Instagram", "url": "@mybrand"},
            ],
        }
        self.card.content_blocks = [
            {
                "type": "gallery",
                "title": "Галерея",
                "items": [{"title": "Фото", "image": "data:image/png;base64,abc"}],
            },
            {
                "type": "video",
                "title": "Відео",
                "items": [{"title": "Огляд", "youtube_url": "https://youtu.be/abc123"}],
            },
            {
                "type": "map",
                "title": "Карта",
                "items": [{"address": "Kyiv, Ukraine"}],
            },
        ]
        self.card.save(update_fields=["design_settings", "content_blocks"])

        response = self.client.post(
            reverse("generate-card", kwargs={"card_id": self.card.pk})
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("data:image/png;base64,abc", body["generated_html"])
        self.assertIn("youtube.com/embed/abc123", body["generated_html"])
        self.assertIn("google.com/maps?q=Kyiv%2C%20Ukraine", body["generated_html"])
        self.assertIn("https://instagram.com/mybrand", body["generated_html"])
        self.assertIn("https://example.com/book", body["generated_html"])

    @override_settings(ANTHROPIC_API_KEY="")
    def test_fallback_html_renders_split_logo(self):
        self.client.force_authenticate(self.user)
        self.card.layout = "split-showcase"
        self.card.design_settings = {
            "split_logo": "data:image/png;base64,logo",
            "enabled_blocks": ["contacts"],
            "section_order": ["contacts"],
        }
        self.card.save(update_fields=["layout", "design_settings"])

        response = self.client.post(
            reverse("generate-card", kwargs={"card_id": self.card.pk})
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("split-logo", body["generated_html"])
        self.assertIn("data:image/png;base64,logo", body["generated_html"])

    @override_settings(ANTHROPIC_API_KEY="")
    def test_removed_deck_layout_falls_back_to_centered(self):
        self.client.force_authenticate(self.user)
        self.card.layout = "deck"
        self.card.save(update_fields=["layout"])

        response = self.client.post(
            reverse("generate-card", kwargs={"card_id": self.card.pk})
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("layout-centered", body["generated_html"])
        self.assertNotIn("layout-deck", body["generated_html"])

    @override_settings(ANTHROPIC_API_KEY="")
    def test_fallback_html_uses_user_language(self):
        self.client.force_authenticate(self.user)
        self.user.language = "ru"
        self.user.save(update_fields=["language"])
        self.card.design_settings = {
            "enabled_blocks": ["services", "contacts"],
            "section_order": ["services", "contacts"],
        }
        self.card.content_blocks = [
            {
                "type": "services",
                "title": "Послуги",
                "description": "Опишіть 3-5 послуг із короткою цінністю, ціною або форматом роботи.",
                "items": [{"name": "Аудит", "description": "Проверка сайта"}],
            },
        ]
        self.card.save(update_fields=["design_settings", "content_blocks"])

        response = self.client.post(
            reverse("generate-card", kwargs={"card_id": self.card.pk})
        )

        self.assertEqual(response.status_code, 200)
        html = response.json()["generated_html"]
        self.assertIn('<html lang="ru">', html)
        self.assertIn("Услуги", html)
        self.assertIn("Опишите 3-5 услуг", html)
        self.assertNotIn("Послуги", html)

    @override_settings(ANTHROPIC_API_KEY="")
    def test_fallback_html_renders_all_filled_block_fields(self):
        self.client.force_authenticate(self.user)
        self.user.language = "ru"
        self.user.save(update_fields=["language"])
        self.card.design_settings = {
            "enabled_blocks": [
                "services",
                "testimonials",
                "team",
                "partners",
                "video",
                "stats",
                "timer",
                "menu",
                "program",
                "specs",
                "comparison",
                "form",
                "contacts",
            ],
            "section_order": [
                "services",
                "testimonials",
                "team",
                "partners",
                "video",
                "stats",
                "timer",
                "menu",
                "program",
                "specs",
                "comparison",
                "form",
                "contacts",
            ],
        }
        self.card.content_blocks = [
            {
                "type": "services",
                "items": [
                    {
                        "name": "Дизайн-аудит",
                        "description": "Разбор интерфейса",
                        "price": "$300",
                        "icon": "Search",
                        "image": "data:image/png;base64,service",
                    }
                ],
            },
            {
                "type": "testimonials",
                "items": [
                    {
                        "name": "Мария",
                        "company": "Acme",
                        "rating": "5/5",
                        "text": "Стало понятнее",
                    }
                ],
            },
            {
                "type": "team",
                "items": [
                    {
                        "name": "Ирина",
                        "role": "Designer",
                        "description": "Ведет визуальную систему",
                        "photo": "data:image/png;base64,team",
                    }
                ],
            },
            {
                "type": "partners",
                "items": [
                    {
                        "name": "North Studio",
                        "url": "example.com/north",
                        "logo": "data:image/png;base64,logo",
                    }
                ],
            },
            {
                "type": "video",
                "items": [
                    {
                        "title": "Обзор продукта",
                        "youtube_url": "https://youtu.be/demo123",
                        "description": "Короткая демонстрация",
                    }
                ],
            },
            {
                "type": "stats",
                "items": [
                    {
                        "value": "100+",
                        "label": "клиентов",
                        "description": "За последние годы",
                    }
                ],
            },
            {
                "type": "timer",
                "items": [
                    {
                        "title": "До запуска",
                        "date": "2026-12-31",
                        "description": "Осталось немного",
                    }
                ],
            },
            {
                "type": "menu",
                "items": [
                    {
                        "category": "Паста",
                        "name": "Pasta Verde",
                        "description": "С базиликом",
                        "price": "$14",
                        "photo": "data:image/png;base64,menu",
                    }
                ],
            },
            {
                "type": "program",
                "items": [
                    {
                        "name": "Модуль 1",
                        "description": "Основы",
                        "duration": "2 часа",
                    }
                ],
            },
            {"type": "specs", "items": [{"name": "Мощность", "value": "2.5 кВт"}]},
            {
                "type": "comparison",
                "items": [
                    {
                        "name": "Pro",
                        "description": "Расширенный пакет",
                        "price": "$799",
                    }
                ],
            },
            {
                "type": "form",
                "items": [{"name": "Телефон", "type": "phone", "required": "yes"}],
            },
        ]
        self.card.save(update_fields=["design_settings", "content_blocks"])

        response = self.client.post(
            reverse("generate-card", kwargs={"card_id": self.card.pk})
        )

        self.assertEqual(response.status_code, 200)
        html = response.json()["generated_html"]
        expected_fragments = [
            "Дизайн-аудит",
            "Разбор интерфейса",
            "$300",
            "Search",
            "data:image/png;base64,service",
            "Мария",
            "Acme",
            "5/5",
            "Стало понятнее",
            "Ирина",
            "Designer",
            "Ведет визуальную систему",
            "data:image/png;base64,team",
            "North Studio",
            "https://example.com/north",
            "data:image/png;base64,logo",
            "Обзор продукта",
            "youtube.com/embed/demo123",
            "Короткая демонстрация",
            "100+",
            "клиентов",
            "За последние годы",
            "До запуска",
            "2026-12-31",
            "Осталось немного",
            "Паста",
            "Pasta Verde",
            "С базиликом",
            "$14",
            "data:image/png;base64,menu",
            "Модуль 1",
            "Основы",
            "2 часа",
            "Мощность",
            "2.5 кВт",
            "Pro",
            "Расширенный пакет",
            "$799",
            "Телефон",
            "phone",
            "да",
        ]
        for fragment in expected_fragments:
            with self.subTest(fragment=fragment):
                self.assertIn(fragment, html)
