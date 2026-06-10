import html

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


def build_prompt(card: Card, request=None) -> str:
    projects = card.projects.all()
    projects_text = "\n".join(
        f"  - {p.name}: {p.description} | кнопка: '{p.link_label}' → {p.link_url or 'немає посилання'}"
        + (f" | фото: {request.build_absolute_uri(p.bg_image.url)}" if p.bg_image and request else "")
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
9. Якщо в проєкта є фото, обов'язково використай його як зображення у карточці проєкту (наприклад, <img src=...>)
10. Hover-ефекти на всіх інтерактивних елементах
11. Обов'язково зроби кожен макет реально іншим: не повторюй один і той самий шаблон. Для centered/sidebar/hero/cards/terminal/magazine використай різну композицію, ритм, акценти та подачу контенту.
12. Відповідність обраній темі та макету
13. Тексти УКРАЇНСЬКОЮ мовою

Поверни тільки HTML, починаючи з <!DOCTYPE html>."""


def build_fallback_html(card: Card, request=None) -> str:
    """Generate a simple but complete HTML page when AI generation is unavailable."""

    theme_styles = {
        "dark-neon": ("#07070d", "#151525", "#e8ff47", "#f5f7fb", "#c5c7d6"),
        "clean-light": ("#eff6ff", "#ffffff", "#2563eb", "#0f172a", "#475569"),
        "warm-cream": ("#fffaf2", "#ffffff", "#d97706", "#422006", "#7c5c42"),
        "ocean-blue": ("#07111f", "#0f172a", "#38bdf8", "#eff6ff", "#bfd7ff"),
        "forest-green": ("#08130d", "#10231a", "#4ade80", "#ecfdf5", "#b7f5c7"),
        "sunset-red": ("#180a0a", "#271111", "#f97316", "#fff7ed", "#fec89a"),
        "minimal-gray": ("#121212", "#1d1d1d", "#f3f4f6", "#f9fafb", "#d1d5db"),
        "purple-haze": ("#140d1f", "#231536", "#a78bfa", "#f5efff", "#ddd6fe"),
    }

    bg, panel, accent, text, muted = theme_styles.get(card.theme, theme_styles["dark-neon"])
    layout_name = (card.layout or "centered").lower()
    layout_class = f"layout-{layout_name}"
    projects = list(card.projects.all())

    def project_image_html(project):
        if not project.bg_image:
            return ""
        image_url = request.build_absolute_uri(project.bg_image.url) if request else project.bg_image.url
        return (
            f'<img src="{html.escape(image_url)}" alt="{html.escape(project.name)}" '
            'style="width:100%;height:140px;object-fit:cover;border-radius:16px;margin-bottom:12px;" />'
        )

    skills = [html.escape(item) for item in (card.skills or [])]
    project_cards = "".join(
        f"""
        <article class=\"project-card\">
          {project_image_html(project)}
          <h3>{html.escape(project.name)}</h3>
          <p>{html.escape(project.description or 'Проєкт без додаткового опису.')}</p>
          {f"<a href=\"{html.escape(project.link_url or '#')}\" target=\"_blank\" rel=\"noreferrer\">{html.escape(project.link_label or 'Переглянути')}</a>" if project.link_url else '<span class="tag">Без посилання</span>'}
        </article>
        """
        for project in projects
    ) or "<p class=\"empty\">Проєкти ще не додані.</p>"

    skills_html = "".join(f"<span class=\"badge\">{skill}</span>" for skill in skills) or "<span class=\"badge\">Професія</span>"
    contact_items = [
        ("Email", card.email),
        ("Телефон", card.phone),
        ("Місто", card.city),
        ("GitHub / сайт", card.github),
        ("Telegram", card.telegram),
        ("LinkedIn", card.linkedin),
    ]
    contacts_html = "".join(
        f"<li><strong>{label}:</strong> {html.escape(value) if value else '—'}</li>"
        for label, value in contact_items
        if value
    ) or "<li>Контактні дані поки не вказані.</li>"

    if layout_name == "sidebar":
        hero_markup = f"""
        <section class=\"hero hero-sidebar\">
          <div class=\"mini-spot\">
            <div class=\"eyebrow\">Сайт-візитка</div>
            <h1>{html.escape(card.full_name or 'Ваше ім’я')}</h1>
            <div class=\"role\">{html.escape(card.role or 'Спеціаліст')}</div>
            <p class=\"bio\">{html.escape(card.bio or 'Короткий опис буде доступний після заповнення форми.')}</p>
          </div>
          <aside class=\"mini-card\">
            <div class=\"mini-label\">Контакти</div>
            <ul>{contacts_html}</ul>
          </aside>
        </section>
        """
    elif layout_name == "hero":
        hero_markup = f"""
        <section class=\"hero hero-spotlight\">
          <div class=\"eyebrow\">Візитка з характером</div>
          <h1>{html.escape(card.full_name or 'Ваше ім’я')}</h1>
          <p class=\"lead\">{html.escape(card.bio or 'Короткий опис буде доступний після заповнення форми.')}</p>
          <div class=\"chip-row\">{skills_html}</div>
        </section>
        """
    elif layout_name == "cards":
        hero_markup = f"""
        <section class=\"hero hero-cards\">
          <div>
            <div class=\"eyebrow\">Профіль у форматі карток</div>
            <h1>{html.escape(card.full_name or 'Ваше ім’я')}</h1>
            <div class=\"role\">{html.escape(card.role or 'Спеціаліст')}</div>
          </div>
          <div class=\"stat-grid\">
            <article class=\"stat-card\"><strong>{len(card.projects.all())}</strong><span>проєктів</span></article>
            <article class=\"stat-card\"><strong>{len(card.skills or [])}</strong><span>навичок</span></article>
            <article class=\"stat-card\"><strong>1</strong><span>сайт-візитка</span></article>
          </div>
        </section>
        """
    elif layout_name == "terminal":
        hero_markup = f"""
        <section class=\"hero hero-terminal\">
          <div class=\"terminal-window\">
            <div class=\"terminal-bar\"><span></span><span></span><span></span></div>
            <div class=\"terminal-line\">$ whois {html.escape(card.full_name or 'specialist')}</div>
            <div class=\"terminal-line\">Role: {html.escape(card.role or 'Спеціаліст')}</div>
            <div class=\"terminal-line\">Status: creative portfolio online</div>
          </div>
          <p class=\"bio\">{html.escape(card.bio or 'Короткий опис буде доступний після заповнення форми.')}</p>
        </section>
        """
    elif layout_name == "magazine":
        hero_markup = f"""
        <section class=\"hero hero-magazine\">
          <div>
            <div class=\"eyebrow\">Editorial</div>
            <h1>{html.escape(card.full_name or 'Ваше ім’я')}</h1>
            <p class=\"lead\">{html.escape(card.bio or 'Короткий опис буде доступний після заповнення форми.')}</p>
          </div>
          <aside class=\"magazine-note\">{html.escape(card.role or 'Спеціаліст')} · {html.escape(card.city or 'Місто')}</aside>
        </section>
        """
    else:
        hero_markup = f"""
        <section class=\"hero\">
          <div>
            <div class=\"eyebrow\">Сайт-візитка</div>
            <h1>{html.escape(card.full_name or 'Ваше ім’я')}</h1>
            <div class=\"role\">{html.escape(card.role or 'Спеціаліст')}</div>
          </div>
          <p class=\"bio\">{html.escape(card.bio or 'Це шаблонна сторінка, яка буде підмінена готовим HTML після генерації AI.')}</p>
        </section>
        """

    return f"""<!DOCTYPE html>
<html lang=\"uk\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>{html.escape(card.full_name)}</title>
  <style>
    :root {{
      color-scheme: dark;
      --bg: {bg};
      --panel: {panel};
      --accent: {accent};
      --text: {text};
      --muted: {muted};
      --shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
      font-family: Arial, Helvetica, sans-serif;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top, rgba(255,255,255,0.04), transparent 25%),
        linear-gradient(135deg, var(--bg), #020617 70%);
      color: var(--text);
    }}
    a {{ color: inherit; text-decoration: none; }}
    .page {{ max-width: 1160px; margin: 0 auto; padding: 24px 16px 60px; }}
    .card {{ background: linear-gradient(145deg, var(--panel), rgba(15, 23, 42, 0.92)); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; box-shadow: var(--shadow); overflow: hidden; }}
    .hero {{ display: grid; gap: 18px; padding: 28px; border-bottom: 1px solid rgba(255,255,255,0.08); }}
    .hero-sidebar {{ grid-template-columns: 1.1fr 0.9fr; align-items: start; }}
    .hero-spotlight {{ background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border-radius: 24px; }}
    .hero-cards {{ grid-template-columns: 1.1fr 0.9fr; align-items: stretch; }}
    .hero-terminal {{ grid-template-columns: 1fr 0.8fr; align-items: center; }}
    .hero-magazine {{ grid-template-columns: 1.2fr 0.8fr; align-items: end; }}
    .lead {{ color: var(--text); line-height: 1.6; max-width: 700px; }}
    .chip-row {{ display: flex; flex-wrap: wrap; gap: 10px; }}
    .mini-card, .magazine-note, .stat-card {{ background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 14px; }}
    .mini-label {{ text-transform: uppercase; letter-spacing: 0.25em; color: var(--accent); font-size: 0.75rem; margin-bottom: 8px; }}
    .stat-grid {{ display: grid; gap: 10px; grid-template-columns: repeat(3, 1fr); }}
    .stat-card strong {{ display: block; font-size: 1.4rem; color: var(--accent); }}
    .stat-card span {{ color: var(--muted); font-size: 0.92rem; }}
    .terminal-window {{ background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow); }}
    .terminal-bar {{ display: flex; gap: 6px; padding: 10px; background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.08); }}
    .terminal-bar span {{ width: 8px; height: 8px; border-radius: 999px; background: rgba(255,255,255,0.2); }}
    .terminal-line {{ font-family: 'Courier New', monospace; padding: 8px 12px; color: #d7f3ff; font-size: 0.92rem; }}
    .eyebrow {{ text-transform: uppercase; letter-spacing: 0.35em; font-size: 0.78rem; color: var(--accent); }}
    h1 {{ font-size: clamp(2.2rem, 8vw, 4rem); line-height: 1.02; margin: 0; }}
    .role {{ font-size: 1.05rem; color: var(--muted); margin-top: 6px; }}
    .bio {{ color: var(--text); max-width: 680px; line-height: 1.6; }}
    .hero-grid {{ display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; }}
    .panel {{ background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 18px; }}
    .badge-row {{ display: flex; flex-wrap: wrap; gap: 10px; }}
    .badge {{ display: inline-flex; align-items: center; border-radius: 999px; padding: 8px 12px; background: rgba(255,255,255,0.08); color: var(--text); border: 1px solid rgba(255,255,255,0.12); font-size: 0.95rem; }}
    .section {{ padding: 24px 28px 8px; }}
    .grid {{ display: grid; gap: 14px; }}
    .grid.two {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }}
    .layout-sidebar .hero-grid {{ grid-template-columns: 320px 1fr; align-items: start; }}
    .layout-hero .hero {{ background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); }}
    .layout-cards .grid.two {{ grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }}
    .layout-terminal .card {{ font-family: 'Courier New', monospace; border-color: rgba(56,189,248,0.22); }}
    .layout-terminal .eyebrow, .layout-terminal .tag {{ letter-spacing: 0.2em; text-transform: uppercase; }}
    .layout-magazine .hero {{ grid-template-columns: 1.2fr 0.8fr; align-items: end; }}
    .project-card {{ background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; padding: 16px; }}
    .project-card h3 {{ margin-top: 0; margin-bottom: 8px; font-size: 1.08rem; }}
    .project-card p {{ color: var(--muted); line-height: 1.5; margin-bottom: 10px; }}
    .project-card a {{ display: inline-flex; align-items: center; gap: 8px; color: var(--accent); font-weight: 600; }}
    .tag {{ display: inline-flex; border-radius: 999px; padding: 6px 10px; background: rgba(255,255,255,0.06); color: var(--muted); font-size: 0.9rem; }}
    ul {{ list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }}
    li {{ background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 10px 12px; color: var(--text); }}
    .empty {{ color: var(--muted); }}
    @media (max-width: 900px) {{
      .hero-grid, .grid.two {{ grid-template-columns: 1fr; }}
    }}
  </style>
</head>
<body>
  <main class=\"page\">
    <article class=\"card {layout_class}\">
      {hero_markup}

      <section class=\"hero-grid\">
        <article class=\"panel\">
          <h2>Про мене</h2>
          <p style=\"color: var(--muted); line-height: 1.6;\">{html.escape(card.bio or 'Короткий опис буде доступний після заповнення форми.')}</p>
        </article>
        <article class=\"panel\">
          <h2>Навички</h2>
          <div class=\"badge-row\">{skills_html}</div>
        </article>
      </section>

      <section class=\"section\">
        <h2>Проєкти</h2>
        <div class=\"grid two\">{project_cards}</div>
      </section>

      <section class=\"section\">
        <h2>Контакти</h2>
        <ul>{contacts_html}</ul>
      </section>
    </article>
  </main>
</body>
</html>
"""


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

        api_key = (settings.ANTHROPIC_API_KEY or "").strip()

        try:
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY не налаштовано")

            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4096,
                messages=[{"role": "user", "content": build_prompt(card, request)}],
            )
            html_content = message.content[0].text

            # Clean markdown fences if present
            if html_content.strip().startswith("```"):
                html_content = html_content.split("```")[1]
                if html_content.startswith("html"):
                    html_content = html_content[4:]

            generated_html = html_content.strip()
        except (anthropic.APIError, ValueError) as e:
            generated_html = build_fallback_html(card, request)
        except Exception as e:
            generated_html = build_fallback_html(card, request)

        card.generated_html = generated_html
        card.save(update_fields=["generated_html"])

        serializer = CardSerializer(card, context={"request": request})
        return Response(serializer.data)
