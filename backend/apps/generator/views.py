import html
import re
from urllib.parse import quote, urlparse

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
    "aurora": "темний північний фон, градієнти бірюзового, м'ятного та рожевого",
    "mono-lime": "монохромна графітова тема з лаймовим RGB-акцентом",
    "rose-gold": "світла тепла тема з рожево-золотим градієнтом",
    "glass-blue": "скляні панелі, холодний блакитний градієнт, blur-ефекти",
    "custom": "користувацькі кольори, RGB та градієнти з налаштувань дизайну",
}

LAYOUTS_DESCRIPTION = {
    "centered": "контент 720-800px по центру: аватар/ім'я/роль/опис/CTA/соцмережі; для простих персональних сторінок",
    "sidebar": "ліва фіксована колонка 320px з профілем і контактами, праворуч довгий контент; для CV, портфоліо, спеціалістів",
    "hero": "перший екран 100vh, 50/50 текст і сильний візуал/акцент, далі переваги/відгуки/послуги/FAQ",
    "cards": "сітка карток 3-4 в ряд для повторюваних сутностей: товари, послуги, меню, кейси",
    "terminal": "весь сайт як термінал з monospace, командами whoami/skills/contacts і ефектом технічного профілю",
    "magazine": "editorial-сторінка як журнал/стаття: 850px текст, великі заголовки, цитати, медіа-вставки",
    "resume": "CV/Word-документ: ліва колонка 30% контакти/навички, права 70% досвід/проєкти/таймлайн",
    "split-showcase": "сучасне чергування 50/50 текст-картинка, потім картинка-текст; для брендів, студій, агентств",
    "gallery": "masonry/галерейна подача з мінімумом тексту і фокусом на зображеннях та роботах",
    "product": "продуктовий лендинг: 60% контент, 40% продукт/рендер, ціна/CTA/демо, далі можливості/переваги/FAQ",
}


def normalize_external_url(value, kind="site"):
    value = (value or "").strip()
    if not value:
        return ""
    if kind == "email":
        return f"mailto:{value}"
    if kind == "phone":
        return f"tel:{value.replace(' ', '').replace('-', '')}"
    if kind == "telegram":
        username = value.replace("@", "").strip("/")
        if username.startswith("http://") or username.startswith("https://"):
            return username
        return f"https://t.me/{username}"
    if value.startswith("http://") or value.startswith("https://"):
        return value
    if kind == "linkedin" and "linkedin.com" not in value:
        return f"https://www.linkedin.com/in/{value.strip('/')}"
    if kind == "github" and "github.com" not in value and "." not in value:
        return f"https://github.com/{value.strip('/')}"
    parsed = urlparse(value)
    if parsed.scheme:
        return value
    return f"https://{value}"


def normalize_social_url(value, platform=""):
    value = (value or "").strip()
    if not value:
        return ""
    if value.startswith(("http://", "https://", "mailto:", "tel:")):
        return value

    platform = (platform or "").lower()
    handle = value.lstrip("@/").strip()
    if "telegram" in platform:
        return "https://t.me/" + re.sub(r"^t\.me/", "", handle, flags=re.I)
    if "instagram" in platform:
        return "https://instagram.com/" + re.sub(r"^instagram\.com/", "", handle, flags=re.I)
    if "twitter" in platform or platform == "x":
        return "https://x.com/" + re.sub(r"^(x|twitter)\.com/", "", handle, flags=re.I)
    if "tiktok" in platform:
        cleaned = re.sub(r"^tiktok\.com/@?", "", handle, flags=re.I).lstrip("@")
        return f"https://www.tiktok.com/@{cleaned}"
    if "facebook" in platform:
        return "https://facebook.com/" + re.sub(r"^facebook\.com/", "", handle, flags=re.I)
    if "youtube" in platform:
        return f"https://{handle}" if "." in handle or "/" in handle else f"https://youtube.com/@{handle}"
    if "whatsapp" in platform:
        digits = re.sub(r"\D+", "", handle)
        return f"https://wa.me/{digits}" if digits else normalize_external_url(value)
    if "github" in platform and "." not in handle and "/" not in handle:
        return f"https://github.com/{handle}"
    if "linkedin" in platform and "linkedin.com" not in handle:
        return "https://www.linkedin.com/in/" + re.sub(r"^in/", "", handle, flags=re.I)
    if "behance" in platform:
        return "https://behance.net/" + re.sub(r"^behance\.net/", "", handle, flags=re.I)
    if "dribbble" in platform:
        return "https://dribbble.com/" + re.sub(r"^dribbble\.com/", "", handle, flags=re.I)
    return normalize_external_url(value)


def is_hex_color(value):
    value = (value or "").strip()
    if not value.startswith("#"):
        return False
    size = len(value)
    return size in (4, 7) and all(char in "0123456789abcdefABCDEF" for char in value[1:])


SECTION_LABELS = {
    "uk": {
        "skills": "Навички",
        "projects": "Кейси / проєкти",
        "services": "Послуги",
        "packages": "Пакети",
        "process": "Процес роботи",
        "testimonials": "Відгуки",
        "faq": "FAQ",
        "team": "Команда",
        "partners": "Партнери",
        "gallery": "Галерея",
        "video": "Відео",
        "stats": "Цифри",
        "timer": "Таймер",
        "map": "Карта",
        "calculator": "Калькулятор",
        "menu": "Меню",
        "program": "Програма",
        "specs": "Характеристики",
        "comparison": "Порівняння",
        "form": "Форма заявки",
        "contacts": "Контакти",
    },
    "ru": {
        "skills": "Навыки",
        "projects": "Кейсы / проекты",
        "services": "Услуги",
        "packages": "Пакеты",
        "process": "Процесс работы",
        "testimonials": "Отзывы",
        "faq": "FAQ",
        "team": "Команда",
        "partners": "Партнеры",
        "gallery": "Галерея",
        "video": "Видео",
        "stats": "Цифры",
        "timer": "Таймер",
        "map": "Карта",
        "calculator": "Калькулятор",
        "menu": "Меню",
        "program": "Программа",
        "specs": "Характеристики",
        "comparison": "Сравнение",
        "form": "Форма заявки",
        "contacts": "Контакты",
    },
    "en": {
        "skills": "Skills",
        "projects": "Cases / projects",
        "services": "Services",
        "packages": "Packages",
        "process": "Work process",
        "testimonials": "Testimonials",
        "faq": "FAQ",
        "team": "Team",
        "partners": "Partners",
        "gallery": "Gallery",
        "video": "Video",
        "stats": "Numbers",
        "timer": "Timer",
        "map": "Map",
        "calculator": "Calculator",
        "menu": "Menu",
        "program": "Program",
        "specs": "Specifications",
        "comparison": "Comparison",
        "form": "Request form",
        "contacts": "Contacts",
    },
}


SECTION_HINTS = {
    "uk": {
        "services": "Опишіть 3-5 послуг із короткою цінністю, ціною або форматом роботи.",
        "packages": "Покажіть базовий, стандартний і преміум-пакет з тим, що входить.",
        "process": "Заявка, короткий дзвінок, виконання роботи, передача результату.",
        "testimonials": "Додайте відгуки клієнтів з ім'ям, компанією, текстом і оцінкою.",
        "faq": "Закрийте найчастіші питання про строки, оплату, гарантії та формат роботи.",
        "team": "Покажіть людей у команді, їхні ролі та короткий опис.",
        "partners": "Додайте логотипи партнерів або клієнтів і посилання.",
        "gallery": "Розмістіть фото або приклади робіт з підписами.",
        "video": "Вставте YouTube-посилання і покажіть компактний перегляд.",
        "stats": "Покажіть цифри: клієнти, роки досвіду, проєкти, результати.",
        "timer": "Додайте дату завершення акції, події або запуску.",
        "map": "Покажіть адресу через Google Maps або OpenStreetMap.",
        "calculator": "Дайте користувачу оцінити вартість за типом послуги та опціями.",
        "menu": "Створіть категорії меню й позиції з фото, описом та ціною.",
        "program": "Опишіть модулі, уроки, тривалість і результат навчання.",
        "specs": "Покажіть характеристики товару: параметр і значення.",
        "comparison": "Порівняйте моделі, пакети або варіанти за ключовими параметрами.",
        "form": "Зберіть заявку: ім'я, телефон, email, дата, коментар.",
    },
    "ru": {
        "services": "Опишите 3-5 услуг с краткой ценностью, ценой или форматом работы.",
        "packages": "Покажите базовый, стандартный и премиум-пакет с тем, что входит.",
        "process": "Заявка, короткий звонок, выполнение работы, передача результата.",
        "testimonials": "Добавьте отзывы клиентов с именем, компанией, текстом и оценкой.",
        "faq": "Закройте частые вопросы о сроках, оплате, гарантиях и формате работы.",
        "team": "Покажите людей в команде, их роли и короткое описание.",
        "partners": "Добавьте логотипы партнеров или клиентов и ссылки.",
        "gallery": "Разместите фото или примеры работ с подписями.",
        "video": "Вставьте YouTube-ссылку и покажите компактный просмотр.",
        "stats": "Покажите цифры: клиенты, годы опыта, проекты, результаты.",
        "timer": "Добавьте дату завершения акции, события или запуска.",
        "map": "Покажите адрес через Google Maps или OpenStreetMap.",
        "calculator": "Дайте пользователю оценить стоимость по типу услуги и опциям.",
        "menu": "Создайте категории меню и позиции с фото, описанием и ценой.",
        "program": "Опишите модули, уроки, длительность и результат обучения.",
        "specs": "Покажите характеристики товара: параметр и значение.",
        "comparison": "Сравните модели, пакеты или варианты по ключевым параметрам.",
        "form": "Соберите заявку: имя, телефон, email, дата, комментарий.",
    },
    "en": {
        "services": "Describe 3-5 services with value, price, or work format.",
        "packages": "Show basic, standard, and premium packages with what is included.",
        "process": "Request, short call, work, delivery.",
        "testimonials": "Add client testimonials with name, company, text, and rating.",
        "faq": "Answer common questions about timing, payment, guarantees, and format.",
        "team": "Show team members, their roles, and a short description.",
        "partners": "Add partner or client logos and links.",
        "gallery": "Place photos or work examples with captions.",
        "video": "Insert a YouTube link and show a compact preview.",
        "stats": "Show numbers: clients, years of experience, projects, results.",
        "timer": "Add the end date for a promotion, event, or launch.",
        "map": "Show the address through Google Maps or OpenStreetMap.",
        "calculator": "Let users estimate cost by service type and options.",
        "menu": "Create menu categories and items with photo, description, and price.",
        "program": "Describe modules, lessons, duration, and learning outcome.",
        "specs": "Show product specifications: parameter and value.",
        "comparison": "Compare models, packages, or variants by key parameters.",
        "form": "Collect a request: name, phone, email, date, comment.",
    },
}


FIELD_LABELS = {
    "uk": {
        "name": "Назва",
        "description": "Опис",
        "price": "Ціна",
        "icon": "Іконка",
        "image": "Фото",
        "question": "Питання",
        "answer": "Відповідь",
        "company": "Компанія",
        "rating": "Оцінка",
        "text": "Текст",
        "role": "Посада",
        "photo": "Фото",
        "url": "Посилання",
        "logo": "Логотип",
        "title": "Назва",
        "youtube_url": "YouTube-посилання",
        "value": "Значення",
        "label": "Підпис",
        "date": "Дата завершення",
        "address": "Адреса",
        "category": "Категорія",
        "duration": "Тривалість",
        "type": "Тип поля",
        "required": "Обов'язкове",
    },
    "ru": {
        "name": "Название",
        "description": "Описание",
        "price": "Цена",
        "icon": "Иконка",
        "image": "Фото",
        "question": "Вопрос",
        "answer": "Ответ",
        "company": "Компания",
        "rating": "Оценка",
        "text": "Текст",
        "role": "Должность",
        "photo": "Фото",
        "url": "Ссылка",
        "logo": "Логотип",
        "title": "Название",
        "youtube_url": "YouTube-ссылка",
        "value": "Значение",
        "label": "Подпись",
        "date": "Дата окончания",
        "address": "Адрес",
        "category": "Категория",
        "duration": "Длительность",
        "type": "Тип поля",
        "required": "Обязательное",
    },
    "en": {
        "name": "Name",
        "description": "Description",
        "price": "Price",
        "icon": "Icon",
        "image": "Photo",
        "question": "Question",
        "answer": "Answer",
        "company": "Company",
        "rating": "Rating",
        "text": "Text",
        "role": "Role",
        "photo": "Photo",
        "url": "Link",
        "logo": "Logo",
        "title": "Title",
        "youtube_url": "YouTube link",
        "value": "Value",
        "label": "Label",
        "date": "End date",
        "address": "Address",
        "category": "Category",
        "duration": "Duration",
        "type": "Field type",
        "required": "Required",
    },
}


TEXT = {
    "uk": {
        "language_name": "українською мовою",
        "not_set": "не вказано",
        "no_link": "немає посилання",
        "go": "Перейти",
        "view": "Переглянути",
        "project_without_description": "Проєкт без додаткового опису.",
        "projects_empty": "Проєкти ще не додані.",
        "profession": "Професія",
        "phone": "Телефон",
        "city": "Місто",
        "github": "GitHub / сайт",
        "social": "Соцмережа",
        "contacts_empty": "Контактні дані поки не вказані.",
        "open_link": "Відкрити посилання",
        "element": "Елемент",
        "block_hint": "Цей блок буде наповнений під обрану нішу та smart fill.",
        "business_card": "Сайт-візитка",
        "your_name": "Ваше ім'я",
        "specialist": "Спеціаліст",
        "short_description": "Короткий опис буде доступний після заповнення форми.",
        "character_card": "Візитка з характером",
        "card_profile": "Профіль у форматі карток",
        "projects_count": "проєктів",
        "skills_count": "навичок",
        "business_card_count": "сайт-візитка",
        "terminal_status": "creative portfolio online",
        "image": "Зображення",
        "template_page": "Це шаблонна сторінка, яка буде замінена готовим HTML після генерації AI.",
        "contact_action": "Зв'язатися",
        "yes": "так",
        "no": "ні",
    },
    "ru": {
        "language_name": "на русском языке",
        "not_set": "не указано",
        "no_link": "нет ссылки",
        "go": "Перейти",
        "view": "Посмотреть",
        "project_without_description": "Проект без дополнительного описания.",
        "projects_empty": "Проекты еще не добавлены.",
        "profession": "Профессия",
        "phone": "Телефон",
        "city": "Город",
        "github": "GitHub / сайт",
        "social": "Соцсеть",
        "contacts_empty": "Контактные данные пока не указаны.",
        "open_link": "Открыть ссылку",
        "element": "Элемент",
        "block_hint": "Этот блок будет заполнен под выбранную нишу и smart fill.",
        "business_card": "Сайт-визитка",
        "your_name": "Ваше имя",
        "specialist": "Специалист",
        "short_description": "Краткое описание появится после заполнения формы.",
        "character_card": "Визитка с характером",
        "card_profile": "Профиль в формате карточек",
        "projects_count": "проектов",
        "skills_count": "навыков",
        "business_card_count": "сайт-визитка",
        "terminal_status": "creative portfolio online",
        "image": "Изображение",
        "template_page": "Это шаблонная страница, которая будет заменена готовым HTML после генерации AI.",
        "contact_action": "Связаться",
        "yes": "да",
        "no": "нет",
    },
    "en": {
        "language_name": "in English",
        "not_set": "not provided",
        "no_link": "no link",
        "go": "Go",
        "view": "View",
        "project_without_description": "Project without an additional description.",
        "projects_empty": "No projects have been added yet.",
        "profession": "Profession",
        "phone": "Phone",
        "city": "City",
        "github": "GitHub / website",
        "social": "Social link",
        "contacts_empty": "Contact details have not been provided yet.",
        "open_link": "Open link",
        "element": "Item",
        "block_hint": "This block will be adapted to the selected niche and smart fill.",
        "business_card": "Business card website",
        "your_name": "Your name",
        "specialist": "Specialist",
        "short_description": "A short description will appear after the form is filled in.",
        "character_card": "Personal site with character",
        "card_profile": "Card-based profile",
        "projects_count": "projects",
        "skills_count": "skills",
        "business_card_count": "business card site",
        "terminal_status": "creative portfolio online",
        "image": "Image",
        "template_page": "This template page will be replaced with generated HTML after AI generation.",
        "contact_action": "Contact",
        "yes": "yes",
        "no": "no",
    },
}


SUPPORTED_LANGUAGES = {"uk", "ru", "en"}
DEFAULT_SECTION_TITLES = {
    key: {labels[key] for labels in SECTION_LABELS.values()}
    for key in SECTION_LABELS["uk"]
}
DEFAULT_SECTION_HINTS = {
    key: {hints[key] for hints in SECTION_HINTS.values() if key in hints}
    for key in SECTION_LABELS["uk"]
}
TITLE_FIELD_ORDER = ("name", "title", "question", "value", "category")
MEDIA_KEYS = {"image", "photo", "logo", "media"}
MEDIA_META_KEYS = {
    "id",
    "image_name",
    "image_type",
    "photo_name",
    "photo_type",
    "logo_name",
    "logo_type",
    "media_name",
    "media_type",
}
DETAIL_FIELD_ORDER = (
    "category",
    "description",
    "text",
    "answer",
    "company",
    "rating",
    "role",
    "price",
    "icon",
    "label",
    "date",
    "duration",
    "type",
    "required",
    "address",
    "url",
    "youtube_url",
)


def get_card_language(card: Card, request=None) -> str:
    user = getattr(request, "user", None) if request else None
    language = getattr(user, "language", None) or getattr(card.owner, "language", None) or "uk"
    language = str(language).split("-")[0].lower()
    return language if language in SUPPORTED_LANGUAGES else "uk"


def text_for(language: str) -> dict:
    return TEXT.get(language, TEXT["uk"])


def section_label(language: str, key: str) -> str:
    return SECTION_LABELS.get(language, SECTION_LABELS["uk"]).get(key, key.title())


def section_hint(language: str, key: str) -> str:
    return SECTION_HINTS.get(language, SECTION_HINTS["uk"]).get(key, text_for(language)["block_hint"])


def field_label(language: str, key: str) -> str:
    return FIELD_LABELS.get(language, FIELD_LABELS["uk"]).get(key, key.replace("_", " ").title())


def resolve_section_title(language: str, key: str, value) -> str:
    title = str(value or "").strip()
    if not title or title in DEFAULT_SECTION_TITLES.get(key, set()):
        return section_label(language, key)
    return title


def resolve_section_hint(language: str, key: str, value) -> str:
    hint = str(value or "").strip()
    if not hint or hint in DEFAULT_SECTION_HINTS.get(key, set()):
        return section_hint(language, key)
    return hint


def build_prompt(card: Card, request=None) -> str:
    projects = card.projects.all()
    design = card.design_settings or {}
    language = get_card_language(card, request)
    copy = text_for(language)
    enabled_blocks = design.get("enabled_blocks") or ["skills", "projects", "testimonials", "faq", "contacts"]
    section_order = design.get("section_order") or enabled_blocks
    content_blocks = [
        block for block in (card.content_blocks or [])
        if isinstance(block, dict) and block.get("type")
    ]
    projects_text = "\n".join(
        f"  - {p.name}: {p.description} | button: '{p.link_label}' -> {p.link_url or copy['no_link']}"
        + (f" | фото: {request.build_absolute_uri(p.bg_image.url)}" if p.bg_image and request else "")
        for p in projects
    ) or f"  {copy['not_set']}"
    blocks_text = "\n".join(
        f"  - {block.get('type')}: {block.get('title') or ''}; {block.get('description') or ''}; items={block.get('items') or []}"
        for block in content_blocks
    ) or f"  {copy['not_set']}"
    social_links = [
        link for link in (design.get("social_links") or [])
        if isinstance(link, dict) and (link.get("url") or "").strip()
    ]
    social_links_text = "\n".join(
        f"  - {link.get('label') or link.get('platform') or copy['social']}: {link.get('url')}"
        for link in social_links
    ) or f"  {copy['not_set']}"

    return f"""Create a complete one-page business card website. Return ONLY HTML code.

PERSON DATA:
- Name: {card.full_name}
- Role: {card.role}
- About / hero text: {card.bio or copy['not_set']}
- Email: {card.email or copy['not_set']}
- Phone: {card.phone or copy['not_set']}
- City: {card.city or copy['not_set']}
- GitHub / website: {card.github or copy['not_set']}
- Telegram: {card.telegram or copy['not_set']}
- LinkedIn: {card.linkedin or copy['not_set']}
- Skills: {', '.join(card.skills) if card.skills else copy['not_set']}

PROJECTS:
{projects_text}

DESIGN:
- Theme: {THEMES_DESCRIPTION.get(card.theme, card.theme)}
- Layout: {LAYOUTS_DESCRIPTION.get(card.layout, card.layout)}
- Custom settings: {design or copy['not_set']}
- Niche / site type: {design.get('template_kind', card.sphere or 'specialist')}
- User smart fill request: {design.get('smart_fill') or copy['not_set']}
- Main clickable button: {design.get('primary_link_label') or copy['go']} -> {design.get('primary_link_url') or copy['not_set']}
- Additional social links:
{social_links_text}
- Enabled template blocks: {', '.join(enabled_blocks)}
- Section order after Hero: {', '.join(section_order)}

FILLED BLOCK DATA:
{blocks_text}

HTML REQUIREMENTS:
1. Full HTML file with <!DOCTYPE html>, head, body
2. Put all styles in <style> inside <head>; do not use external files
3. Responsive design (mobile-first, media queries)
4. Load Google Fonts through @import
5. Smooth CSS entrance animations
6. Hero is required. Show the about/description text only under the name or heading in Hero; do not create a separate About section.
7. Show skills as badges
8. Project buttons must use real links when URLs are provided
9. If a project has a photo, use it as the project card image, for example <img src=...>
10. Add hover effects to all interactive elements
11. Make each layout genuinely different: centered, sidebar, hero, cards, terminal, magazine, resume, split-showcase, gallery, and product need different composition, rhythm, accents, and content presentation.
12. Match the selected theme and layout
13. All generated website text must be {copy['language_name']}
14. Social links, email, phone, GitHub/website, Telegram, and LinkedIn must be clickable links.
15. Render only enabled template blocks. Always include contacts. Do not add a separate About section.
16. If custom RGB/gradient colors are provided, use them in CSS variables, background, buttons, and accents.
17. Respect the given section order after Hero.
18. If smart fill describes a profession/product/business, fill enabled blocks with relevant draft copy, but do not invent facts that contradict provided data.
19. Add CSS protection against overflow: overflow-wrap:anywhere; word-break:break-word; max-width:100%; min-width:0 for cards, columns, and text blocks.
20. If blocks contain data:image or image URLs, show them as <img>. Do not ask the user to paste media links.
21. If a video block has a YouTube URL, insert a mini iframe preview through youtube.com/embed.
22. If a map/address block exists, show a Google Maps or OpenStreetMap iframe and separate copyable address text.
23. For every niche/template, use the main clickable button when a URL is provided.
24. For split-showcase, use design_settings.split_logo as the image/logo in the visual half instead of initials when it exists.
25. Every filled field from every block item must be visible in the generated page: price, icon, company, rating, date, duration, category, links, required/type, media, and any text fields.

Return only HTML, starting with <!DOCTYPE html>."""


def build_fallback_html(card: Card, request=None) -> str:
    """Generate a simple but complete HTML page when AI generation is unavailable."""

    language = get_card_language(card, request)
    copy = text_for(language)
    theme_styles = {
        "dark-neon": ("#07070d", "#151525", "#e8ff47", "#f5f7fb", "#c5c7d6"),
        "clean-light": ("#eff6ff", "#ffffff", "#2563eb", "#0f172a", "#475569"),
        "warm-cream": ("#fffaf2", "#ffffff", "#d97706", "#422006", "#7c5c42"),
        "ocean-blue": ("#07111f", "#0f172a", "#38bdf8", "#eff6ff", "#bfd7ff"),
        "forest-green": ("#08130d", "#10231a", "#4ade80", "#ecfdf5", "#b7f5c7"),
        "sunset-red": ("#180a0a", "#271111", "#f97316", "#fff7ed", "#fec89a"),
        "minimal-gray": ("#121212", "#1d1d1d", "#f3f4f6", "#f9fafb", "#d1d5db"),
        "purple-haze": ("#140d1f", "#231536", "#a78bfa", "#f5efff", "#ddd6fe"),
        "aurora": ("#061417", "#10272c", "#5eead4", "#f8fafc", "#bae6fd"),
        "mono-lime": ("#080a09", "#161a17", "#bef264", "#f7fee7", "#d9f99d"),
        "rose-gold": ("#fff7f4", "#ffffff", "#e11d48", "#341316", "#9f6b72"),
        "glass-blue": ("#071827", "#10243a", "#60a5fa", "#eff6ff", "#bfdbfe"),
        "custom": ("#07070d", "#151525", "#e8ff47", "#f5f7fb", "#c5c7d6"),
    }

    bg, panel, accent, text, muted = theme_styles.get(card.theme, theme_styles["dark-neon"])
    design = card.design_settings or {}
    if is_hex_color(design.get("background")):
        bg = design["background"]
    if is_hex_color(design.get("surface")):
        panel = design["surface"]
    if is_hex_color(design.get("accent")):
        accent = design["accent"]
    if is_hex_color(design.get("text")):
        text = design["text"]
    gradient = design.get("gradient") or f"linear-gradient(135deg, {bg}, #020617 70%)"
    if not isinstance(gradient, str) or "gradient" not in gradient:
        gradient = f"linear-gradient(135deg, {bg}, #020617 70%)"
    radius = int(design.get("radius", 28) or 28)
    density = design.get("density", "comfortable")
    page_padding = 14 if density == "compact" else 24
    default_sections = ["skills", "projects", "testimonials", "faq", "contacts"]
    valid_sections = list(SECTION_LABELS["uk"].keys())
    enabled_blocks = [
        item for item in (design.get("enabled_blocks") or default_sections)
        if item in valid_sections
    ] or default_sections
    if "contacts" not in enabled_blocks:
        enabled_blocks.append("contacts")
    section_order = [
        item for item in (design.get("section_order") or enabled_blocks)
        if item in enabled_blocks
    ]
    section_order = section_order + [item for item in enabled_blocks if item not in section_order]
    layout_name = (card.layout or "centered").lower()
    if layout_name not in LAYOUTS_DESCRIPTION:
        layout_name = "centered"
    layout_class = f"layout-{layout_name}"
    projects = list(card.projects.all())
    primary_link_url = normalize_external_url(design.get("primary_link_url"))
    primary_link_label = str(design.get("primary_link_label") or copy["go"])
    primary_cta_html = (
        f'<a class="custom-cta" href="{html.escape(primary_link_url)}" target="_blank" rel="noreferrer">'
        f'{html.escape(primary_link_label)}</a>'
        if primary_link_url else ""
    )
    split_logo = str(design.get("split_logo") or "").strip()
    split_logo_alt = html.escape(card.full_name or "Logo")
    split_logo_html = (
        f'<img class="split-logo" src="{html.escape(split_logo)}" alt="{split_logo_alt}" />'
        if split_logo.startswith(("data:image/", "http://", "https://")) else ""
    )

    def project_image_html(project):
        if not project.bg_image:
            return ""
        image_url = request.build_absolute_uri(project.bg_image.url) if request else project.bg_image.url
        return (
            f'<img src="{html.escape(image_url)}" alt="{html.escape(project.name)}" '
            'style="width:100%;height:140px;object-fit:cover;border-radius:16px;margin-bottom:12px;" />'
        )

    def project_link_html(project):
        if project.link_url:
            href = html.escape(normalize_external_url(project.link_url) or "#")
            label = html.escape(project.link_label or copy["view"])
            return f'<a href="{href}" target="_blank" rel="noreferrer">{label}</a>'
        return f'<span class="tag">{html.escape(copy["no_link"])}</span>'

    def project_media_html(project):
        return (
            project_image_html(project)
            or f'<div class="image-placeholder">{html.escape(copy["image"])}</div>'
        )

    skills = [html.escape(item) for item in (card.skills or [])]
    project_cards = "".join(
        f"""
        <article class=\"project-card\">
          {project_image_html(project)}
          <h3>{html.escape(project.name)}</h3>
          <p>{html.escape(project.description or copy['project_without_description'])}</p>
          {project_link_html(project)}
        </article>
        """
        for project in projects
    ) or f"<p class=\"empty\">{html.escape(copy['projects_empty'])}</p>"
    project_grid_class = "grid two single" if len(projects) == 1 else "grid two"
    alternating_project_cards = "".join(
        f"""
        <article class=\"project-card project-row {'reverse' if index % 2 else ''}\">
          <div class=\"project-copy\">
            <h3>{html.escape(project.name)}</h3>
            <p>{html.escape(project.description or copy['project_without_description'])}</p>
            {project_link_html(project)}
          </div>
          <div class=\"project-media\">{project_media_html(project)}</div>
        </article>
        """
        for index, project in enumerate(projects)
    ) or f"<p class=\"empty\">{html.escape(copy['projects_empty'])}</p>"

    skills_html = "".join(f"<span class=\"badge\">{skill}</span>" for skill in skills) or f"<span class=\"badge\">{html.escape(copy['profession'])}</span>"
    contact_items = [
        ("Email", card.email, normalize_external_url(card.email, "email")),
        (copy["phone"], card.phone, normalize_external_url(card.phone, "phone")),
        (copy["city"], card.city, ""),
        (copy["github"], card.github, normalize_external_url(card.github, "github")),
        ("Telegram", card.telegram, normalize_external_url(card.telegram, "telegram")),
        ("LinkedIn", card.linkedin, normalize_external_url(card.linkedin, "linkedin")),
    ]
    for link in design.get("social_links") or []:
        if not isinstance(link, dict) or not (link.get("url") or "").strip():
            continue
        label = str(link.get("label") or link.get("platform") or copy["social"])
        contact_items.append((label, label, normalize_social_url(link.get("url"), link.get("platform"))))
    contacts_html = "".join(
        f"<li><strong>{label}:</strong> "
        + (
            f"<a href=\"{html.escape(url)}\" target=\"_blank\" rel=\"noreferrer\">{html.escape(value)}</a>"
            if url else html.escape(value)
        )
        + "</li>"
        for label, value, url in contact_items
        if value
    ) or f"<li>{html.escape(copy['contacts_empty'])}</li>"
    content_block_map = {
        block.get("type"): block
        for block in (card.content_blocks or [])
        if isinstance(block, dict) and block.get("type")
    }

    def render_custom_block(block, index):
        block_type = html.escape(str(block.get("type") or "text"))
        title = html.escape(str(block.get("title") or ""))
        text_value = html.escape(str(block.get("text") or ""))
        label = html.escape(str(block.get("label") or copy["open_link"]))
        url = normalize_external_url(block.get("url"))
        x = max(0, min(92, int(block.get("x", 6) or 6)))
        y = max(0, min(92, int(block.get("y", 8 + index * 8) or 8)))
        w = max(18, min(96, int(block.get("w", 40) or 40)))
        h = max(12, min(80, int(block.get("h", 22) or 22)))
        align = block.get("align") if block.get("align") in {"left", "center", "right"} else "left"
        block_bg = block.get("bg") if is_hex_color(block.get("bg")) else "rgba(255,255,255,0.06)"
        block_color = block.get("color") if is_hex_color(block.get("color")) else "var(--text)"
        style = (
            f"left:{x}%;top:{y}%;width:{w}%;min-height:{h}%;"
            f"text-align:{align};background:{block_bg};color:{block_color};"
        )
        if block_type == "button":
            body = f"<a class=\"custom-cta\" href=\"{html.escape(url or '#')}\" target=\"_blank\" rel=\"noreferrer\">{label}</a>"
        elif block_type == "quote":
            body = f"<blockquote>{text_value}</blockquote>"
        elif block_type == "stats":
            body = f"<strong class=\"custom-stat\">{title or '99+'}</strong><span>{text_value or copy['projects_count']}</span>"
            title = ""
        elif block_type == "divider":
            body = "<hr />"
        else:
            body = f"<p>{text_value}</p>" if text_value else ""
        return f"""
        <article class=\"custom-block custom-{block_type}\" style=\"{style}\">
          {f'<h3>{title}</h3>' if title else ''}
          {body}
        </article>
        """

    skills_section_html = f"""
      <section class=\"section\">
        <article class=\"panel\">
          <h2>{html.escape(section_label(language, "skills"))}</h2>
          <div class=\"badge-row\">{skills_html}</div>
        </article>
      </section>
    """
    projects_section_html = f"""
      <section class=\"section\">
        <h2>{html.escape(section_label(language, "projects"))}</h2>
        <div class=\"{project_grid_class}\">
          {project_cards}
        </div>
      </section>
    """
    contacts_section_html = f"""
      <section class=\"section\">
        <h2>{html.escape(section_label(language, "contacts"))}</h2>
        <ul>{contacts_html}</ul>
      </section>
    """

    def has_item_content(item):
        if not isinstance(item, dict):
            return False
        return any(str(value or "").strip() for key, value in item.items() if key not in MEDIA_META_KEYS)

    def first_media_src(item):
        for key in ("image", "photo", "logo", "media"):
            value = str(item.get(key) or "").strip()
            if value.startswith(("data:image/", "http://", "https://")):
                return value
        return ""

    def youtube_embed_url(value):
        value = str(value or "").strip()
        if not value:
            return ""
        match = (
            re.search(r"youtu\.be/([^?&/]+)", value, re.I)
            or re.search(r"[?&]v=([^?&/]+)", value, re.I)
            or re.search(r"youtube\.com/shorts/([^?&/]+)", value, re.I)
            or re.search(r"youtube\.com/embed/([^?&/]+)", value, re.I)
        )
        return f"https://www.youtube.com/embed/{match.group(1)}" if match else ""

    def item_title_and_key(item):
        for key in TITLE_FIELD_ORDER:
            value = str(item.get(key) or "").strip()
            if value:
                return value, key
        return copy["element"], ""

    def normalized_field_value(key, value):
        value = str(value or "").strip()
        if key != "required":
            return value
        value_lower = value.lower()
        if value_lower in {"yes", "true", "1", "required", "обязательное", "обов'язкове", "так", "да"}:
            return copy["yes"]
        if value_lower in {"no", "false", "0", "optional", "необязательное", "необов'язкове", "ні", "нет"}:
            return copy["no"]
        return value

    def render_field_value(key, value):
        value = normalized_field_value(key, value)
        if key == "url":
            href = normalize_external_url(value)
            return f'<a href="{html.escape(href)}" target="_blank" rel="noreferrer">{html.escape(value)}</a>' if href else html.escape(value)
        if key == "youtube_url":
            href = normalize_external_url(value)
            return f'<a href="{html.escape(href)}" target="_blank" rel="noreferrer">{html.escape(value)}</a>' if href else html.escape(value)
        return html.escape(value)

    def render_item_details(item, title_key):
        seen = set()
        rows = []
        ordered_keys = list(DETAIL_FIELD_ORDER) + sorted(item.keys())
        for key in ordered_keys:
            if key in seen:
                continue
            seen.add(key)
            if key == title_key or key in MEDIA_KEYS or key in MEDIA_META_KEYS:
                continue
            value = str(item.get(key) or "").strip()
            if not value:
                continue
            rows.append(
                f'<li><strong>{html.escape(field_label(language, key))}:</strong> '
                f'<span>{render_field_value(key, value)}</span></li>'
            )
        return f'<ul class="field-list">{"".join(rows)}</ul>' if rows else ""

    def render_block_item(section_key, item):
        title, title_key = item_title_and_key(item)
        media_src = first_media_src(item)
        video_src = youtube_embed_url(item.get("youtube_url"))
        address = str(item.get("address") or "").strip()
        media_html = (
            f'<img class="media-preview" src="{html.escape(media_src)}" alt="{html.escape(title)}" />'
            if media_src else ""
        )
        video_html = (
            f'<iframe class="video-preview" src="{html.escape(video_src)}" title="{html.escape(title)}" '
            'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" '
            'allowfullscreen></iframe>'
            if video_src else ""
        )
        map_html = (
            f'<iframe class="map-preview" src="https://www.google.com/maps?q={quote(address)}&output=embed" '
            f'title="{html.escape(address)}"></iframe><p class="address">{html.escape(address)}</p>'
            if section_key == "map" and address else ""
        )
        details_html = render_item_details(item, title_key)
        return f"""
            <article class=\"mini-card\">
              {media_html}
              {video_html}
              {map_html}
              <h3>{html.escape(title)}</h3>
              {details_html}
            </article>
        """

    def generic_section_html(section_key):
        block = content_block_map.get(section_key, {})
        label = resolve_section_title(language, section_key, block.get("title"))
        hint = resolve_section_hint(language, section_key, block.get("description"))
        items = block.get("items") if isinstance(block.get("items"), list) else []
        visible_items = [item for item in items if has_item_content(item)]
        items_html = "".join(
            render_block_item(section_key, item)
            for item in visible_items
        )
        grid_class = "grid two single" if len(visible_items) == 1 else "grid two"
        grid_html = f'<div class="{grid_class}">{items_html}</div>' if items_html else ""
        return f"""
      <section class=\"section\">
        <article class=\"panel\">
          <h2>{html.escape(label)}</h2>
          <p>{html.escape(hint)}</p>
          {grid_html}
        </article>
      </section>
        """

    section_html_map = {
        "projects": projects_section_html,
        "skills": skills_section_html,
        "contacts": contacts_section_html,
    }
    ordered_sections_html = "\n".join(
        section_html_map.get(section) or generic_section_html(section)
        for section in section_order
    )

    if layout_name == "sidebar":
        hero_markup = f"""
        <section class=\"hero hero-sidebar\">
          <div class=\"mini-spot\">
            <div class=\"eyebrow\">{html.escape(copy['business_card'])}</div>
            <h1>{html.escape(card.full_name or copy['your_name'])}</h1>
            <div class=\"role\">{html.escape(card.role or copy['specialist'])}</div>
            <p class=\"bio\">{html.escape(card.bio or copy['short_description'])}</p>
            {primary_cta_html}
          </div>
          <aside class=\"mini-card\">
            <div class=\"mini-label\">{html.escape(section_label(language, "contacts"))}</div>
            <ul>{contacts_html}</ul>
          </aside>
        </section>
        """
    elif layout_name == "hero":
        hero_markup = f"""
        <section class=\"hero hero-spotlight\">
          <div class=\"eyebrow\">{html.escape(copy['character_card'])}</div>
          <h1>{html.escape(card.full_name or copy['your_name'])}</h1>
          <p class=\"lead\">{html.escape(card.bio or copy['short_description'])}</p>
          <div class=\"chip-row\">{skills_html}</div>
          {primary_cta_html}
        </section>
        """
    elif layout_name == "cards":
        hero_markup = f"""
        <section class=\"hero hero-cards\">
          <div>
            <div class=\"eyebrow\">{html.escape(copy['card_profile'])}</div>
            <h1>{html.escape(card.full_name or copy['your_name'])}</h1>
            <div class=\"role\">{html.escape(card.role or copy['specialist'])}</div>
            <p class=\"bio\">{html.escape(card.bio or copy['short_description'])}</p>
            {primary_cta_html}
          </div>
          <div class=\"stat-grid\">
            <article class=\"stat-card\"><strong>{len(card.projects.all())}</strong><span>{html.escape(copy['projects_count'])}</span></article>
            <article class=\"stat-card\"><strong>{len(card.skills or [])}</strong><span>{html.escape(copy['skills_count'])}</span></article>
            <article class=\"stat-card\"><strong>1</strong><span>{html.escape(copy['business_card_count'])}</span></article>
          </div>
        </section>
        """
    elif layout_name == "terminal":
        hero_markup = f"""
        <section class=\"hero hero-terminal\">
          <div class=\"terminal-window\">
            <div class=\"terminal-bar\"><span></span><span></span><span></span></div>
            <div class=\"terminal-line\">$ whois {html.escape(card.full_name or copy['specialist'])}</div>
            <div class=\"terminal-line\">Role: {html.escape(card.role or copy['specialist'])}</div>
            <div class=\"terminal-line\">Status: {html.escape(copy['terminal_status'])}</div>
          </div>
          <p class=\"bio\">{html.escape(card.bio or copy['short_description'])}</p>
          {primary_cta_html}
        </section>
        """
    elif layout_name == "magazine":
        hero_markup = f"""
        <section class=\"hero hero-magazine\">
          <div>
            <div class=\"eyebrow\">Editorial</div>
            <h1>{html.escape(card.full_name or copy['your_name'])}</h1>
            <p class=\"lead\">{html.escape(card.bio or copy['short_description'])}</p>
            {primary_cta_html}
          </div>
          <aside class=\"magazine-note\">{html.escape(card.role or copy['specialist'])} · {html.escape(card.city or copy['city'])}</aside>
        </section>
        """
    elif layout_name == "resume":
        hero_markup = f"""
        <section class=\"hero hero-resume\">
          <aside class=\"mini-card\">
            <div class=\"mini-label\">CV</div>
            <ul>{contacts_html}</ul>
          </aside>
          <div>
            <h1>{html.escape(card.full_name or copy['your_name'])}</h1>
            <div class=\"role\">{html.escape(card.role or copy['specialist'])}</div>
            <p class=\"bio\">{html.escape(card.bio or copy['short_description'])}</p>
            {primary_cta_html}
          </div>
        </section>
        """
    elif layout_name == "split-showcase":
        split_cover_content = (
            split_logo_html
            or f'<span>{html.escape((card.full_name or "CF")[:2].upper())}</span>'
        )
        hero_markup = f"""
        <section class=\"hero hero-split\">
          <div class=\"split-cover\">{split_cover_content}</div>
          <div>
            <div class=\"eyebrow\">Showcase</div>
            <h1>{html.escape(card.full_name or copy['your_name'])}</h1>
            <p class=\"lead\">{html.escape(card.bio or copy['short_description'])}</p>
            {primary_cta_html}
          </div>
        </section>
        """
    elif layout_name == "gallery":
        hero_markup = f"""
        <section class=\"hero hero-gallery\">
          <div>
            <div class=\"eyebrow\">Gallery</div>
            <h1>{html.escape(card.full_name or copy['your_name'])}</h1>
            <p class=\"bio\">{html.escape(card.bio or copy['short_description'])}</p>
            {primary_cta_html}
          </div>
          <div class=\"chip-row\">{skills_html}</div>
        </section>
        """
    elif layout_name == "product":
        hero_markup = f"""
        <section class=\"hero hero-product\">
          <div>
            <div class=\"eyebrow\">Personal product</div>
            <h1>{html.escape(card.full_name or copy['your_name'])}</h1>
            <p class=\"lead\">{html.escape(card.role or copy['specialist'])}</p>
            <p class=\"bio\">{html.escape(card.bio or copy['short_description'])}</p>
            {primary_cta_html}
          </div>
          <a class=\"custom-cta secondary-cta\" href=\"{html.escape(normalize_external_url(card.email, 'email') or '#')}\">{html.escape(copy['contact_action'])}</a>
        </section>
        """
    else:
        hero_markup = f"""
        <section class=\"hero\">
          <div>
            <div class=\"eyebrow\">{html.escape(copy['business_card'])}</div>
            <h1>{html.escape(card.full_name or copy['your_name'])}</h1>
            <div class=\"role\">{html.escape(card.role or copy['specialist'])}</div>
          </div>
          <p class=\"bio\">{html.escape(card.bio or copy['template_page'])}</p>
          {primary_cta_html}
        </section>
        """

    return f"""<!DOCTYPE html>
<html lang=\"{language}\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>{html.escape(card.full_name or copy['business_card'])}</title>
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
    * {{ box-sizing: border-box; min-width: 0; }}
    body {{
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top, rgba(255,255,255,0.04), transparent 25%),
        {gradient};
      color: var(--text);
    }}
    a {{ color: inherit; text-decoration: none; }}
    h1, h2, h3, p, li, a, span, strong, blockquote, .terminal-line {{ overflow-wrap: anywhere; word-break: break-word; max-width: 100%; }}
    .page {{ max-width: 1160px; margin: 0 auto; padding: {page_padding}px 16px 60px; }}
    .card {{ background: linear-gradient(145deg, var(--panel), rgba(15, 23, 42, 0.92)); border: 1px solid rgba(255,255,255,0.08); border-radius: {radius}px; box-shadow: var(--shadow); overflow: hidden; }}
    .hero {{ display: grid; gap: 18px; padding: 28px; border-bottom: 1px solid rgba(255,255,255,0.08); }}
    .hero-sidebar {{ grid-template-columns: 1.1fr 0.9fr; align-items: start; }}
    .hero-spotlight {{ background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border-radius: 24px; }}
    .hero-cards {{ grid-template-columns: 1.1fr 0.9fr; align-items: stretch; }}
    .hero-terminal {{ grid-template-columns: 1fr 0.8fr; align-items: center; }}
    .hero-magazine {{ grid-template-columns: 1.2fr 0.8fr; align-items: end; }}
	    .hero-split, .hero-product {{ grid-template-columns: 1.1fr 0.9fr; align-items: center; }}
    .hero-resume {{ grid-template-columns: 320px 1fr; align-items: start; }}
    .hero-gallery {{ grid-template-columns: 1fr; }}
	    .split-cover {{ min-height: 320px; border-radius: 24px; background: linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02)); display: grid; place-items: center; padding: 28px; overflow: hidden; }}
	    .split-cover span {{ font-size: clamp(5rem, 18vw, 11rem); color: var(--accent); font-weight: 800; line-height: 0.9; }}
	    .split-logo {{ width: 100%; height: 100%; min-height: 320px; object-fit: cover; border-radius: 18px; display: block; }}
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
    .grid.alternating {{ grid-template-columns: 1fr; }}
	    .layout-sidebar .hero-grid {{ grid-template-columns: 320px 1fr; align-items: start; }}
	    .layout-centered {{ max-width: 860px; margin: 0 auto; text-align: center; }}
	    .layout-centered .hero, .layout-centered .section {{ justify-items: center; }}
	    .layout-centered .badge-row, .layout-centered .chip-row {{ justify-content: center; }}
	    .layout-sidebar .hero-sidebar .mini-spot {{ position: sticky; top: 24px; }}
	    .layout-hero .hero {{ background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); }}
	    .layout-cards .grid.two {{ grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }}
	    .card.layout-terminal {{ font-family: 'Courier New', monospace; border-color: rgba(56,189,248,0.22); }}
	    .layout-terminal .eyebrow, .layout-terminal .tag {{ letter-spacing: 0.2em; text-transform: uppercase; }}
	    .layout-magazine .hero {{ grid-template-columns: 1.2fr 0.8fr; align-items: end; }}
	    .layout-magazine .section {{ max-width: 900px; margin: 0 auto; }}
	    .layout-resume .section .panel {{ border-left: 4px solid var(--accent); }}
	    .layout-split-showcase .section:nth-of-type(odd) .grid.two > article:nth-child(even) {{ transform: translateY(18px); }}
	    .layout-gallery .grid.two {{ grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); align-items: start; }}
	    .layout-product .hero-product {{ min-height: 520px; }}
	    .layout-centered .grid.two.single, .layout-hero .grid.two.single, .layout-cards .grid.two.single, .layout-magazine .grid.two.single, .layout-product .grid.two.single {{ grid-template-columns: minmax(220px, 520px); justify-content: center; }}
	    .project-card {{ background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; padding: 16px; }}
    .project-card h3 {{ margin-top: 0; margin-bottom: 8px; font-size: 1.08rem; }}
    .project-card p {{ color: var(--muted); line-height: 1.5; margin-bottom: 10px; }}
    .project-card a {{ display: inline-flex; align-items: center; gap: 8px; color: var(--accent); font-weight: 600; }}
    .project-row {{ display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, 0.72fr); gap: 16px; align-items: stretch; }}
    .project-row.reverse {{ grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1fr); }}
    .project-row.reverse .project-copy {{ order: 2; }}
    .project-row.reverse .project-media {{ order: 1; }}
    .project-media img {{ height: 100% !important; min-height: 190px; margin-bottom: 0 !important; }}
    .image-placeholder {{ min-height: 190px; border-radius: 16px; border: 1px dashed rgba(255,255,255,0.16); display: grid; place-items: center; color: var(--accent); background: rgba(255,255,255,0.04); }}
	    .custom-cta {{ display: inline-flex; align-items: center; justify-content: center; min-height: 42px; border-radius: 999px; padding: 10px 18px; color: #050505; background: var(--accent); font-weight: 800; }}
	    .secondary-cta {{ background: transparent; color: var(--accent); border: 1px solid rgba(255,255,255,0.18); }}
    .inline-link {{ display: inline-flex; color: var(--accent); font-weight: 700; margin-top: 8px; }}
	    .field-list {{ display: grid; gap: 8px; margin-top: 10px; }}
	    .field-list li {{ display: grid; gap: 3px; background: rgba(255,255,255,0.035); border-radius: 14px; padding: 9px 10px; }}
	    .field-list strong {{ color: var(--accent); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; }}
	    .field-list span, .field-list a {{ color: var(--text); line-height: 1.45; }}
	    .media-preview {{ width: 100%; height: 180px; object-fit: cover; border-radius: 16px; display: block; margin-bottom: 12px; }}
	    .video-preview {{ width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 16px; background: #000; margin-bottom: 12px; }}
	    .map-preview {{ width: 100%; height: 240px; border: 0; border-radius: 16px; background: #101010; margin-bottom: 10px; }}
	    .address {{ user-select: text; color: var(--muted); font-family: 'Courier New', monospace; font-size: 0.9rem; }}
    .free-board {{ position: relative; min-height: 520px; border-radius: 26px; background: rgba(255,255,255,0.035); border: 1px dashed rgba(255,255,255,0.15); overflow: hidden; }}
    .custom-block {{ position: absolute; border-radius: 20px; border: 1px solid rgba(255,255,255,0.12); padding: 16px; box-shadow: 0 18px 34px rgba(0,0,0,0.22); backdrop-filter: blur(10px); }}
    .custom-block h3 {{ margin: 0 0 8px; }}
    .custom-block p, .custom-block blockquote {{ margin: 0; line-height: 1.55; color: inherit; }}
    .custom-stat {{ display: block; font-size: 2rem; color: var(--accent); }}
    .tag {{ display: inline-flex; border-radius: 999px; padding: 6px 10px; background: rgba(255,255,255,0.06); color: var(--muted); font-size: 0.9rem; }}
    ul {{ list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }}
    li {{ background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 10px 12px; color: var(--text); }}
    .empty {{ color: var(--muted); }}
    @media (max-width: 900px) {{
      .hero-grid, .grid.two {{ grid-template-columns: 1fr; }}
      .project-row, .project-row.reverse {{ grid-template-columns: 1fr; }}
      .project-row.reverse .project-copy, .project-row.reverse .project-media {{ order: initial; }}
	      .hero-sidebar, .hero-cards, .hero-terminal, .hero-magazine, .hero-resume, .hero-split, .hero-product {{ grid-template-columns: 1fr; }}
      .free-board {{ display: grid; gap: 12px; min-height: 0; padding: 12px; }}
      .custom-block {{ position: static; width: auto !important; min-height: 0 !important; }}
    }}
  </style>
</head>
<body>
  <main class=\"page\">
    <article class=\"card {layout_class}\">
      {hero_markup}

      {ordered_sections_html}
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
                max_tokens=8192,
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
