from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

THEME_CHOICES = [
    ("dark-neon", "Dark Neon"),
    ("clean-light", "Clean Light"),
    ("warm-cream", "Warm Cream"),
    ("ocean-blue", "Ocean Blue"),
    ("forest-green", "Forest Green"),
    ("sunset-red", "Sunset Red"),
    ("minimal-gray", "Minimal Gray"),
    ("purple-haze", "Purple Haze"),
    ("aurora", "Aurora"),
    ("mono-lime", "Mono Lime"),
    ("rose-gold", "Rose Gold"),
    ("glass-blue", "Glass Blue"),
    ("custom", "Custom"),
]

LAYOUT_CHOICES = [
    ("centered", "Centered"),
    ("sidebar", "Sidebar"),
    ("hero", "Hero"),
    ("cards", "Cards"),
    ("terminal", "Terminal"),
    ("magazine", "Magazine"),
    ("deck", "Presentation Deck"),
    ("resume", "Resume"),
    ("split-showcase", "Split Showcase"),
    ("gallery", "Gallery"),
    ("product", "Product"),
]


class Card(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cards")

    # Personal info
    full_name = models.CharField(_("повне ім'я"), max_length=128)
    role = models.CharField(_("посада"), max_length=128)
    bio = models.TextField(_("про себе"), blank=True)

    # Contacts
    email = models.EmailField(_("email"), blank=True)
    phone = models.CharField(_("телефон"), max_length=32, blank=True)
    city = models.CharField(_("місто"), max_length=64, blank=True)
    github = models.CharField(_("github/сайт"), max_length=255, blank=True)
    telegram = models.CharField(_("telegram"), max_length=128, blank=True)
    linkedin = models.CharField(_("linkedin"), max_length=255, blank=True)

    # Skills (JSON list)
    skills = models.JSONField(_("навички"), default=list)

    # Design
    theme = models.CharField(_("тема"), max_length=32, choices=THEME_CHOICES, default="dark-neon")
    layout = models.CharField(_("макет"), max_length=32, choices=LAYOUT_CHOICES, default="centered")
    sphere = models.CharField(_("сфера"), max_length=32, default="developer")
    design_settings = models.JSONField(_("налаштування дизайну"), default=dict, blank=True)
    content_blocks = models.JSONField(_("кастомні блоки"), default=list, blank=True)

    # Generated HTML (cached)
    generated_html = models.TextField(_("згенерований HTML"), blank=True)

    # Metadata
    slug = models.SlugField(_("slug"), max_length=64, unique=True, blank=True)
    is_public = models.BooleanField(_("публічна"), default=True)
    views_count = models.PositiveIntegerField(_("перегляди"), default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("візитка")
        verbose_name_plural = _("візитки")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.owner.email})"


class CardProject(models.Model):
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="projects")
    name = models.CharField(_("назва"), max_length=128)
    description = models.TextField(_("опис"), blank=True)
    link_label = models.CharField(_("текст кнопки"), max_length=64, default="Переглянути")
    link_url = models.URLField(_("URL посилання"), blank=True)
    bg_image = models.ImageField(_("фонове зображення"), upload_to="projects/", null=True, blank=True)
    order = models.PositiveSmallIntegerField(_("порядок"), default=0)

    class Meta:
        ordering = ["order"]
        verbose_name = _("проєкт")
        verbose_name_plural = _("проєкти")

    def __str__(self):
        return self.name
