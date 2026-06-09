import anthropic
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.cards.models import Card
from apps.cards.serializers import CardSerializer


THEMES_DESCRIPTION = {
    "dark-neon": "темний фон (#0a0a0f), неоново-жовтий акцент (#e8ff47), шрифт Bebas Neue для заголовків",
    "clean-light": "білий фон, синій акцент (#2563eb), шрифт DM Sans, мінімалізм",
    "warm-cream": "кремовий фон (#fdf6e3), теплий оранжевий акцент (#d97706)",
    "ocean-blue": "темно-синій фон (#0c1445), голубий акцент (#38bdf8)",
    "forest-green": "темно-зелений фон (#0d1f0d), яскраво-зелений акцент (#4ade80)",
    "sunset-red": "темно-червоний фон (#2d0a0a), помаранчевий акцент (#f97316)",
    "minimal-gray": "темно-сірий фон (#1a1a1a), білий акцент, мінімалізм",
    "purple-haze": "темно-фіолетовий фон (#1a0d2e), фіолетовий акцент (#a78bfa)",
}

LAYOUTS_DESCRIPTION = {
    "centered": "вертикально-центрований однорядковий макет",
    "sidebar": "двоколонний: лівий сайдбар з фото/контактами, права колонка з контентом",
    "hero": "великий hero-блок на весь екран, потім секції нижче",
    "cards": "сітка карток для кожної секції",
    "terminal": "стиль терміналу/консолі з моноширинним шрифтом",
    "magazine": "журнальний editorial-макет з великими заголовками",
}


def build_prompt(card: Card) -> str:
    projects = card.projects.all()
    projects_text = "\n".join(
        f"  - {p.name}: {p.description} | кнопка: '{p.link_label}' → {p.link_url or 'немає посилання'}"
        for p in projects
    ) or "  не вказано"

    return f"""Створи повноцінний одностоpінковий HTML сайт-візитку. Поверни ТІЛЬКИ HTML код.

ДАНІ ЛЮДИНИ:
- Ім'я: {card.full_name}
- Посада: {card.role}
- Про себе: {card.bio or 'не вказано'}
- Email: {card.email or 'не вказано'}
- Телефон: {card.phone or 'не вказано'}
- Місто: {card.city or 'не вказано'}
- GitHub/Сайт: {card.github or 'не вказано'}
- Telegram: {card.telegram or 'не вказано'}
- LinkedIn: {card.linkedin or 'не вказано'}
- Навички: {', '.join(card.skills) if card.skills else 'не вказано'}

ПРОЄКТИ:
{projects_text}

ДИЗАЙН:
- Тема: {THEMES_DESCRIPTION.get(card.theme, card.theme)}
- Макет: {LAYOUTS_DESCRIPTION.get(card.layout, card.layout)}

ВИМОГИ ДО HTML:
1. Повний HTML файл з <!DOCTYPE html>, head, body
2. Всі стилі у <style> всередині <head> (без зовнішніх файлів)
3. Адаптивний дизайн (mobile-first, media queries)
4. Google Fonts через @import
5. Плавні CSS анімації появи елементів
6. Секції: Hero, Про себе, Навички, Проєкти, Контакти
7. Навички у вигляді бейджів
8. Кнопки проєктів з реальними посиланнями (якщо є URL)
9. Hover-ефекти на всіх інтерактивних елементах
10. Відповідність обраній темі та макету
11. Тексти УКРАЇНСЬКОЮ мовою

Поверни тільки HTML, починаючи з <!DOCTYPE html>."""


class GenerateCardView(APIView):
    """POST /api/generator/<card_id>/generate/ — генерація через AI"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, card_id):
        try:
            card = Card.objects.prefetch_related("projects").get(
                pk=card_id, owner=request.user
            )
        except Card.DoesNotExist:
            return Response({"error": "Візитку не знайдено"}, status=404)

        api_key = settings.ANTHROPIC_API_KEY
        if not api_key:
            return Response(
                {"error": "ANTHROPIC_API_KEY не налаштовано"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4096,
                messages=[{"role": "user", "content": build_prompt(card)}],
            )
            html = message.content[0].text

            # Clean markdown fences if present
            if html.strip().startswith("```"):
                html = html.split("```")[1]
                if html.startswith("html"):
                    html = html[4:]

            card.generated_html = html.strip()
            card.save(update_fields=["generated_html"])

            serializer = CardSerializer(card, context={"request": request})
            return Response(serializer.data)

        except anthropic.APIError as e:
            return Response(
                {"error": f"Помилка Anthropic API: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as e:
            return Response(
                {"error": f"Помилка генерації: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
