# 🃏 CardForge — Генератор сайтів-візиток

> Дипломний проєкт · React 18 + Django 4.2 + PostgreSQL + Docker

---

## 📁 Структура проєкту

```
cardforge/
├── backend/                  # Django REST API
│   ├── cardforge/            # Налаштування проєкту
│   │   ├── settings.py
│   │   └── urls.py
│   ├── apps/
│   │   ├── users/            # Кастомна модель User, JWT, профіль
│   │   ├── cards/            # Модель Card + CardProject, CRUD
│   │   └── generator/        # Anthropic AI генерація HTML
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                 # React 18 SPA
│   ├── src/
│   │   ├── api/              # Axios клієнт + автооновлення токена
│   │   ├── components/
│   │   │   ├── layout/       # AppLayout (navbar)
│   │   │   └── ui/           # CardForm, LanguageSwitcher
│   │   ├── i18n/             # uk.json, ru.json, en.json
│   │   ├── pages/            # Landing, Login, Register, Dashboard,
│   │   │                     # Create/Edit, Profile, Public, 404
│   │   ├── store/            # Zustand authStore
│   │   ├── App.jsx           # Маршрутизація + провайдери
│   │   └── index.js
│   ├── public/index.html
│   ├── package.json
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf            # Reverse proxy
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Швидкий старт

### 1. Клонування та налаштування

```bash
git clone <repo-url> cardforge
cd cardforge

# Скопіюй та заповни .env
cp .env.example .env
nano .env
```

### 2. Обов'язкові змінні в .env

| Змінна | Де взяти |
|--------|----------|
| `SECRET_KEY` | Згенеруй: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Там само |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

### 3. Запуск через Docker Compose

```bash
docker-compose up --build
```

| Сервіс | URL |
|--------|-----|
| Frontend (React) | http://localhost:3000 |
| Backend (Django) | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/api/docs/ |
| Django Admin | http://localhost:8000/admin/ |
| Nginx (prod) | http://localhost:80 |

### 4. Створення суперкористувача

```bash
docker-compose exec backend python manage.py createsuperuser
```

---

## 🔐 Налаштування Google OAuth

1. Зайди на [console.cloud.google.com](https://console.cloud.google.com)
2. Створи проєкт → **APIs & Services** → **Credentials**
3. **Create Credentials** → **OAuth 2.0 Client ID** → Web application
4. Authorized redirect URIs:
   - `http://localhost:8000/accounts/google/login/callback/`
5. Скопіюй `Client ID` та `Client Secret` → `.env`
6. В Django Admin → **Sites** → встанови домен `localhost:8000`
7. **Social Applications** → Add → Google → вкажи Client ID та Secret

---

## 🌐 API Endpoints

### Auth
| Method | URL | Опис |
|--------|-----|------|
| POST | `/api/auth/login/` | Вхід (email + password) |
| POST | `/api/auth/registration/` | Реєстрація |
| POST | `/api/auth/logout/` | Вихід |
| POST | `/api/auth/token/refresh/` | Оновлення JWT |
| POST | `/api/auth/social/google/` | Google OAuth |

### Users
| Method | URL | Опис |
|--------|-----|------|
| GET/PATCH | `/api/users/me/` | Профіль поточного користувача |
| POST | `/api/users/language/` | Змінити мову |

### Cards
| Method | URL | Опис |
|--------|-----|------|
| GET | `/api/cards/` | Список своїх візиток |
| POST | `/api/cards/` | Створити нову |
| GET/PATCH/DELETE | `/api/cards/{id}/` | Конкретна візитка |
| GET | `/api/cards/public/{slug}/` | Публічна сторінка |
| POST | `/api/cards/{id}/projects/` | Додати проєкт |
| DELETE | `/api/cards/{id}/projects/{pid}/` | Видалити проєкт |

### Generator
| Method | URL | Опис |
|--------|-----|------|
| POST | `/api/generator/{id}/generate/` | AI-генерація HTML |

---

## 🎨 Теми та макети

**Теми:** Dark Neon · Clean Light · Warm Cream · Ocean Blue · Forest Green · Sunset Red · Minimal Gray · Purple Haze

**Макети:** Centered · Sidebar · Hero · Cards · Terminal · Magazine

---

## 🌍 Локалізація (i18n)

Переклади знаходяться у `frontend/src/i18n/`:
- `uk.json` — Українська (мова за замовчуванням)
- `ru.json` — Русский
- `en.json` — English

Мова зберігається в `localStorage` (`cardforge_lang`) та синхронізується з БД для авторизованих користувачів.

---

## 🛠 Технічний стек

### Backend
- **Django 4.2** + **Django REST Framework**
- **django-allauth** + **dj-rest-auth** — автентифікація + Google OAuth
- **djangorestframework-simplejwt** — JWT токени
- **Anthropic SDK** — AI генерація через Claude Sonnet
- **PostgreSQL** — основна БД
- **Redis** — кеш
- **drf-spectacular** — OpenAPI / Swagger документація

### Frontend
- **React 18** + **React Router v6** — SPA з багатосторінковою навігацією
- **Zustand** — стан авторизації
- **React Query** — серверний стан / кешування
- **react-hook-form** — форми
- **Framer Motion** — анімації
- **i18next + react-i18next** — локалізація
- **@react-oauth/google** — Google One Tap
- **Axios** — HTTP клієнт з перехоплювачами

### Infrastructure
- **Docker + Docker Compose** — контейнеризація
- **Nginx** — reverse proxy
- **Gunicorn** — WSGI сервер (production)

---

## 📋 Для дипломної роботи

Проєкт реалізує:
- ✅ Реєстрація/вхід через email та Google OAuth
- ✅ JWT автентифікація з автоматичним оновленням токенів
- ✅ CRUD операції для сайтів-візиток
- ✅ AI-генерація HTML через Anthropic Claude API
- ✅ Багатосторінкова SPA навігація (React Router)
- ✅ Локалізація трьома мовами (UK/RU/EN)
- ✅ Завантаження зображень (аватар, фони проєктів)
- ✅ Публічні URL для кожної візитки (`/c/{slug}`)
- ✅ Адаптивний дизайн
- ✅ Docker Compose для розгортання
- ✅ REST API з Swagger документацією
