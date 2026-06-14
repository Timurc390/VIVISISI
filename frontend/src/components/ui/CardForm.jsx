import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  Brush,
  Clipboard,
  Download,
  Eye,
  FileText,
  Globe2,
  GripVertical,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  Plus,
  Save,
  Send,
  Settings2,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

const THEMES = ['dark-neon','clean-light','warm-cream','ocean-blue','forest-green','sunset-red','minimal-gray','purple-haze','aurora','mono-lime','rose-gold','glass-blue','custom'];
const LAYOUTS = ['centered','sidebar','hero','cards','terminal','magazine','resume','split-showcase','gallery','product'];
const THEME_GRADIENTS = {
  'dark-neon': 'linear-gradient(135deg,#0f0f1a,#1a0f2e)',
  'clean-light': 'linear-gradient(135deg,#f8fafc,#e2e8f0)',
  'warm-cream': 'linear-gradient(135deg,#fdf6e3,#f5deb3)',
  'ocean-blue': 'linear-gradient(135deg,#0c1445,#1a3a5c)',
  'forest-green': 'linear-gradient(135deg,#0d1f0d,#1a3a1a)',
  'sunset-red': 'linear-gradient(135deg,#2d0a0a,#4a1515)',
  'minimal-gray': 'linear-gradient(135deg,#1a1a1a,#2d2d2d)',
  'purple-haze': 'linear-gradient(135deg,#1a0d2e,#2d1a4a)',
  'aurora': 'linear-gradient(135deg,#061417,#123a3a,#6ee7b7,#f0abfc)',
  'mono-lime': 'linear-gradient(135deg,#080a09,#1b221c,#bef264)',
  'rose-gold': 'linear-gradient(135deg,#fff7f4,#fbcfe8,#f59e0b)',
  'glass-blue': 'linear-gradient(135deg,#071827,#164e63,#60a5fa)',
  'custom': 'linear-gradient(135deg,#111118,#e8ff47)',
};

const LAYOUT_ICONS = {
  centered:MonitorSmartphone, sidebar:Layers, hero:Sparkles, cards:LayoutGrid, terminal:FileText, magazine:FileText,
  resume:FileText, 'split-showcase':Layers, gallery:ImageIcon, product:Globe2,
};

const PRESET_SKILLS = ['React','Node.js','TypeScript','Python','Django','Docker','PostgreSQL','Figma','AWS','Vue.js','GraphQL','Redis','Kubernetes','Flutter','Swift'];
const DEFAULT_DESIGN = {
  background: '#0a0a0f',
  surface: '#111118',
  accent: '#e8ff47',
  text: '#f0ede8',
  gradient: 'linear-gradient(135deg,#0a0a0f,#1a0f2e)',
  gradient_angle: 135,
  gradient_from: '#0a0a0f',
  gradient_via: '#1a0f2e',
  gradient_to: '#e8ff47',
  radius: 18,
  density: 'comfortable',
  template_kind: 'specialist',
  enabled_blocks: ['skills', 'projects', 'testimonials', 'faq'],
  section_order: ['skills', 'projects', 'testimonials', 'faq', 'contacts'],
  smart_fill: '',
  primary_link_label: '',
  primary_link_url: '',
  social_links: [],
  split_logo: '',
  split_logo_name: '',
};
const GRADIENT_PRESETS = [
  { angle:135, from:'#0a0a0f', via:'#1a0f2e', to:'#e8ff47' },
  { angle:135, from:'#061417', via:'#123a3a', to:'#6ee7b7' },
  { angle:135, from:'#111827', via:'#2563eb', to:'#7dd3fc' },
  { angle:135, from:'#fff7ed', via:'#fb7185', to:'#f59e0b' },
  { angle:135, from:'#171717', via:'#404040', to:'#bef264' },
  { angle:135, from:'#1f2937', via:'#7c3aed', to:'#ec4899' },
];
const NICHES = [
  { value:'specialist', label:'Specialist', icon:Sparkles },
  { value:'services', label:'Services', icon:Layers },
  { value:'product', label:'Product', icon:Globe2 },
  { value:'shop', label:'Shop', icon:LayoutGrid },
  { value:'course', label:'Course', icon:FileText },
  { value:'event', label:'Event', icon:MonitorSmartphone },
  { value:'restaurant', label:'Restaurant', icon:ImageIcon },
  { value:'agency', label:'Agency', icon:Layers },
  { value:'portfolio', label:'Portfolio', icon:ImageIcon },
  { value:'gallery', label:'Gallery', icon:ImageIcon },
];
const LAYOUT_DETAILS = {
  centered:'A focused page with name, description, buttons, and social links centered.',
  sidebar:'A fixed profile column on the left with detailed content on the right.',
  hero:'A strong 50/50 first screen with a clear CTA for services, agencies, and startups.',
  cards:'A card grid for products, services, menus, and many similar items.',
  terminal:'A terminal-like site for developers, DevOps, and technical profiles.',
  magazine:'An editorial layout with strong typography, long text blocks, quotes, and visuals.',
  resume:'A CV layout with contacts and skills on the left, experience and projects on the right.',
  'split-showcase':'Modern 50/50 text and visual alternation for brands, studios, and agencies.',
  gallery:'A masonry/gallery presentation for visual content, photos, 3D, art, and works.',
  product:'A product landing page with content, visual, CTA, benefits, reviews, FAQ, and pricing.',
};
const SECTION_CONFIG = {
  skills: { label:'Skills', icon:Sparkles },
  projects: { label:'Cases / projects', icon:ImageIcon },
  services: { label:'Services', icon:Layers },
  packages: { label:'Packages', icon:LayoutGrid },
  process: { label:'Process', icon:Send },
  testimonials: { label:'Testimonials', icon:MessageCircle },
  faq: { label:'FAQ', icon:FileText },
  team: { label:'Team', icon:Layers },
  partners: { label:'Partners', icon:Globe2 },
  gallery: { label:'Gallery', icon:ImageIcon },
  video: { label:'Video', icon:MonitorSmartphone },
  stats: { label:'Numbers', icon:LayoutGrid },
  timer: { label:'Timer', icon:Eye },
  map: { label:'Map', icon:MapPin },
  calculator: { label:'Calculator', icon:Settings2 },
  menu: { label:'Menu', icon:FileText },
  program: { label:'Program', icon:FileText },
  specs: { label:'Specifications', icon:FileText },
  comparison: { label:'Comparison', icon:LayoutGrid },
  form: { label:'Form', icon:Mail },
  contacts: { label:'Contacts', icon:Mail },
};
const DEFAULT_SECTION_ORDER = DEFAULT_DESIGN.section_order;
const TEMPLATE_BLOCKS = {
  specialist: ['skills', 'projects', 'testimonials', 'faq', 'stats', 'video', 'gallery', 'contacts'],
  services: ['services', 'packages', 'calculator', 'process', 'team', 'partners', 'testimonials', 'faq', 'contacts'],
  product: ['gallery', 'specs', 'comparison', 'faq', 'timer', 'stats', 'testimonials', 'contacts'],
  shop: ['gallery', 'services', 'testimonials', 'faq', 'map', 'contacts'],
  course: ['program', 'video', 'team', 'gallery', 'testimonials', 'faq', 'timer', 'contacts'],
  event: ['program', 'timer', 'gallery', 'map', 'faq', 'form', 'contacts'],
  restaurant: ['menu', 'gallery', 'testimonials', 'map', 'form', 'contacts'],
  agency: ['services', 'projects', 'process', 'team', 'partners', 'testimonials', 'faq', 'contacts'],
  portfolio: ['skills', 'projects', 'gallery', 'testimonials', 'faq', 'contacts'],
  gallery: ['gallery', 'video', 'stats', 'testimonials', 'contacts'],
};

const BLOCK_FIELD_SCHEMAS = {
  services: { label:'service', fields:[['name','Name'],['description','Description','textarea'],['price','Price'],['icon','Icon'],['image','Photo','media']] },
  packages: { label:'package', fields:[['name','Name'],['price','Price'],['description','What is included','textarea']] },
  process: { label:'step', fields:[['name','Step name'],['description','Description','textarea']] },
  testimonials: { label:'testimonial', fields:[['name','Name'],['company','Company'],['rating','Rating'],['text','Text','textarea']] },
  faq: { label:'question', fields:[['question','Question'],['answer','Answer','textarea']] },
  team: { label:'team member', fields:[['name','Name'],['role','Role'],['description','Description','textarea'],['photo','Photo','media']] },
  partners: { label:'partner', fields:[['name','Name'],['url','Clickable link'],['logo','Logo','media']] },
  gallery: { label:'media item', fields:[['title','Caption'],['image','Photo','media'],['description','Description','textarea']] },
  video: { label:'video', fields:[['title','Title'],['youtube_url','YouTube link','youtube'],['description','Description','textarea']] },
  stats: { label:'number', fields:[['value','Value'],['label','Label'],['description','Description']] },
  timer: { label:'timer', fields:[['title','Title'],['date','End date','date'],['description','Description','textarea']] },
  map: { label:'map', fields:[['address','Address']] },
  calculator: { label:'option', fields:[['name','Name'],['price','Price / coefficient'],['description','Description','textarea']] },
  menu: { label:'menu item', fields:[['category','Category'],['name','Name'],['description','Description','textarea'],['price','Price'],['photo','Photo','media']] },
  program: { label:'module', fields:[['name','Name'],['description','Description','textarea'],['duration','Duration']] },
  specs: { label:'specification', fields:[['name','Parameter'],['value','Value']] },
  comparison: { label:'variant', fields:[['name','Model / package'],['description','Description','textarea'],['price','Price']] },
  form: { label:'form field', fields:[['name','Field name'],['type','Field type'],['required','Required']] },
};

const SOCIAL_PLATFORMS = ['Instagram','X / Twitter','Facebook','TikTok','YouTube','WhatsApp','Telegram','LinkedIn','GitHub','Behance','Dribbble','Website','Custom'];
const DEFAULT_GO_LABELS = ['Перейти', 'Переглянути', 'Go', 'View'];
const TITLE_FIELD_KEYS = ['name', 'title', 'question', 'value', 'category'];
const MEDIA_FIELD_KEYS = ['image', 'photo', 'logo', 'media'];
const MEDIA_META_FIELD_KEYS = ['id', 'image_name', 'image_type', 'photo_name', 'photo_type', 'logo_name', 'logo_type', 'media_name', 'media_type'];
const DETAIL_FIELD_KEYS = ['category', 'description', 'text', 'answer', 'company', 'rating', 'role', 'price', 'icon', 'label', 'date', 'duration', 'type', 'required', 'address', 'url', 'youtube_url'];
const DEMO_PRESETS = {
  ru: {
    specialist: { full_name:'Антон Коваленко', role:'Unity Developer', bio:'Разрабатываю игровые прототипы, интерактивные симуляции и AR/VR-сцены для продуктов, обучения и презентаций.', smart_fill:'Я Unity-разработчик, хочу показать опыт, навыки и кейсы.', cta_label:'Записаться на звонок', cta_url:'https://cal.com/demo', skills:['Unity','C#','AR/VR','Game Design','Blender','Git'], projects:[['VR Training Demo','Интерактивный тренажер для обучения сотрудников с прогрессом и аналитикой.'],['Mobile Puzzle Game','Мобильный puzzle-прототип с процедурными уровнями и мягкой монетизацией.']] },
    services: { full_name:'Studio North', role:'Создание сайтов и бренд-дизайн', bio:'Помогаем малому бизнесу быстро упаковать услугу: стратегия, дизайн, сайт, запуск рекламы и аналитика.', smart_fill:'Мы продаем услуги дизайна и разработки сайтов.', cta_label:'Оставить заявку', cta_url:'https://example.com/brief', skills:['Landing Page','Branding','SEO','Analytics','React'], projects:[['Сайт для клиники','Упаковали услугу, добавили форму записи и блок доверия.'],['Сайт для студии','Собрали портфолио, кейсы и систему заявок.']] },
    product: { full_name:'AirCool Pro', role:'Умный кондиционер для дома', bio:'Тихое охлаждение, управление со смартфона и экономия электроэнергии до 30% в сезон.', smart_fill:'Я продаю кондиционеры с монтажом и гарантией.', cta_label:'Купить сейчас', cta_url:'https://example.com/buy', skills:['Гарантия','Монтаж','Доставка','Smart Home'], projects:[['Комплект для квартиры','Подбор мощности, доставка и монтаж за один день.'],['Комплект для офиса','Система охлаждения для рабочих зон и переговорных.']] },
    shop: { full_name:'Urban Shelf', role:'Магазин товаров для дома', bio:'Подбираем лаконичные аксессуары, свет и декор для современных квартир и студий.', smart_fill:'Интернет-магазин товаров для дома.', cta_label:'Открыть каталог', cta_url:'https://example.com/catalog', skills:['Доставка','Оплата онлайн','Гарантия','Подбор'] },
    course: { full_name:'Motion Lab', role:'Онлайн-курс по моушн-дизайну', bio:'Практический курс для дизайнеров, которые хотят создавать анимации для интерфейсов, рекламы и соцсетей.', smart_fill:'Онлайн-курс по моушн-дизайну для начинающих.', cta_label:'Записаться на курс', cta_url:'https://example.com/course', skills:['After Effects','Figma','Portfolio','Mentoring'] },
    event: { full_name:'Product Meetup Kyiv', role:'Встреча продуктовых команд', bio:'Один вечер с докладами, нетворкингом и практическими кейсами о запуске digital-продуктов.', smart_fill:'Мероприятие для продуктовых команд и стартапов.', cta_label:'Забронировать место', cta_url:'https://example.com/event', skills:['Talks','Networking','Workshops','Q&A'] },
    restaurant: { full_name:'Casa Verde', role:'Итальянский ресторан', bio:'Домашняя паста, сезонные продукты, вино и спокойная атмосфера для ужинов с друзьями.', smart_fill:'Ресторан с меню, интерьером, отзывами и бронированием.', cta_label:'Забронировать стол', cta_url:'https://example.com/reserve', skills:['Паста','Вино','Бронь','Доставка'] },
    agency: { full_name:'Bright Agency', role:'Маркетинговое агентство', bio:'Строим понятную систему привлечения клиентов: стратегия, креативы, performance и отчеты без лишнего шума.', smart_fill:'Агентство маркетинга для малого и среднего бизнеса.', cta_label:'Обсудить проект', cta_url:'https://example.com/start', skills:['Strategy','Performance','Creative','CRM','Analytics'] },
    portfolio: { full_name:'Mira Sokolova', role:'3D Artist', bio:'Создаю стилизованные 3D-сцены, персонажей и продуктовые визуализации для игр, рекламы и презентаций.', smart_fill:'Портфолио 3D artist с галереей и кейсами.', cta_label:'Посмотреть работы', cta_url:'https://example.com/portfolio', skills:['Blender','ZBrush','Substance','Lighting','Render'] },
    gallery: { full_name:'Frame Works', role:'Фотогалерея и визуальные серии', bio:'Минималистичная галерея для серий фото, арт-проектов и визуальных исследований.', smart_fill:'Галерея визуального контента.', cta_label:'Открыть галерею', cta_url:'https://example.com/gallery', skills:['Photo','Editorial','Retouch','Art Direction'] },
  },
  uk: {
    specialist: { full_name:'Антон Коваленко', role:'Unity Developer', bio:'Розробляю ігрові прототипи, інтерактивні симуляції та AR/VR-сцени для продуктів, навчання і презентацій.', smart_fill:'Я Unity-розробник, хочу показати досвід, навички й кейси.', cta_label:'Записатися на дзвінок', cta_url:'https://cal.com/demo', skills:['Unity','C#','AR/VR','Game Design','Blender','Git'], projects:[['VR Training Demo','Інтерактивний тренажер для навчання співробітників із прогресом та аналітикою.'],['Mobile Puzzle Game','Мобільний puzzle-прототип із процедурними рівнями та м’якою монетизацією.']] },
    services: { full_name:'Studio North', role:'Створення сайтів і бренд-дизайн', bio:'Допомагаємо малому бізнесу швидко упакувати послугу: стратегія, дизайн, сайт, запуск реклами й аналітика.', smart_fill:'Ми продаємо послуги дизайну та розробки сайтів.', cta_label:'Залишити заявку', cta_url:'https://example.com/brief', skills:['Landing Page','Branding','SEO','Analytics','React'], projects:[['Сайт для клініки','Упакували послугу, додали форму запису та блок довіри.'],['Сайт для студії','Зібрали портфоліо, кейси та систему заявок.']] },
    product: { full_name:'AirCool Pro', role:'Розумний кондиціонер для дому', bio:'Тихе охолодження, керування зі смартфона та економія електроенергії до 30% за сезон.', smart_fill:'Я продаю кондиціонери з монтажем і гарантією.', cta_label:'Купити зараз', cta_url:'https://example.com/buy', skills:['Гарантія','Монтаж','Доставка','Smart Home'], projects:[['Комплект для квартири','Підбір потужності, доставка і монтаж за один день.'],['Комплект для офісу','Система охолодження для робочих зон і переговорних кімнат.']] },
    shop: { full_name:'Urban Shelf', role:'Магазин товарів для дому', bio:'Підбираємо лаконічні аксесуари, світло й декор для сучасних квартир і студій.', smart_fill:'Інтернет-магазин товарів для дому.', cta_label:'Відкрити каталог', cta_url:'https://example.com/catalog', skills:['Доставка','Оплата онлайн','Гарантія','Підбір'] },
    course: { full_name:'Motion Lab', role:'Онлайн-курс із моушн-дизайну', bio:'Практичний курс для дизайнерів, які хочуть створювати анімації для інтерфейсів, реклами й соцмереж.', smart_fill:'Онлайн-курс із моушн-дизайну для початківців.', cta_label:'Записатися на курс', cta_url:'https://example.com/course', skills:['After Effects','Figma','Portfolio','Mentoring'] },
    event: { full_name:'Product Meetup Kyiv', role:'Зустріч продуктових команд', bio:'Один вечір із доповідями, нетворкінгом і практичними кейсами про запуск digital-продуктів.', smart_fill:'Подія для продуктових команд і стартапів.', cta_label:'Забронювати місце', cta_url:'https://example.com/event', skills:['Talks','Networking','Workshops','Q&A'] },
    restaurant: { full_name:'Casa Verde', role:'Італійський ресторан', bio:'Домашня паста, сезонні продукти, вино та спокійна атмосфера для вечерь із друзями.', smart_fill:'Ресторан із меню, інтер’єром, відгуками та бронюванням.', cta_label:'Забронювати стіл', cta_url:'https://example.com/reserve', skills:['Паста','Вино','Бронювання','Доставка'] },
    agency: { full_name:'Bright Agency', role:'Маркетингова агенція', bio:'Будуємо зрозумілу систему залучення клієнтів: стратегія, креативи, performance і звіти без зайвого шуму.', smart_fill:'Маркетингова агенція для малого та середнього бізнесу.', cta_label:'Обговорити проєкт', cta_url:'https://example.com/start', skills:['Strategy','Performance','Creative','CRM','Analytics'] },
    portfolio: { full_name:'Mira Sokolova', role:'3D Artist', bio:'Створюю стилізовані 3D-сцени, персонажів і продуктові візуалізації для ігор, реклами й презентацій.', smart_fill:'Портфоліо 3D artist із галереєю та кейсами.', cta_label:'Переглянути роботи', cta_url:'https://example.com/portfolio', skills:['Blender','ZBrush','Substance','Lighting','Render'] },
    gallery: { full_name:'Frame Works', role:'Фотогалерея та візуальні серії', bio:'Мінімалістична галерея для серій фото, артпроєктів і візуальних досліджень.', smart_fill:'Галерея візуального контенту.', cta_label:'Відкрити галерею', cta_url:'https://example.com/gallery', skills:['Photo','Editorial','Retouch','Art Direction'] },
  },
  en: {
    specialist: { full_name:'Anton Kovalenko', role:'Unity Developer', bio:'I build game prototypes, interactive simulations, and AR/VR scenes for products, training, and presentations.', smart_fill:'I am a Unity developer and want to show experience, skills, and cases.', cta_label:'Book a call', cta_url:'https://cal.com/demo', skills:['Unity','C#','AR/VR','Game Design','Blender','Git'], projects:[['VR Training Demo','An interactive employee training simulator with progress tracking and analytics.'],['Mobile Puzzle Game','A mobile puzzle prototype with procedural levels and soft monetization.']] },
    services: { full_name:'Studio North', role:'Website creation and brand design', bio:'We help small businesses package their offer quickly: strategy, design, website, ad launch, and analytics.', smart_fill:'We sell design and website development services.', cta_label:'Send a request', cta_url:'https://example.com/brief', skills:['Landing Page','Branding','SEO','Analytics','React'], projects:[['Clinic website','Packaged the service, added booking form, and trust blocks.'],['Studio website','Built a portfolio, cases, and request flow.']] },
    product: { full_name:'AirCool Pro', role:'Smart air conditioner for home', bio:'Quiet cooling, smartphone control, and up to 30% energy savings during the season.', smart_fill:'I sell air conditioners with installation and warranty.', cta_label:'Buy now', cta_url:'https://example.com/buy', skills:['Warranty','Installation','Delivery','Smart Home'], projects:[['Apartment kit','Power selection, delivery, and installation in one day.'],['Office kit','Cooling system for work zones and meeting rooms.']] },
    shop: { full_name:'Urban Shelf', role:'Home goods store', bio:'We curate minimal accessories, lighting, and decor for modern apartments and studios.', smart_fill:'Online store for home goods.', cta_label:'Open catalog', cta_url:'https://example.com/catalog', skills:['Delivery','Online payment','Warranty','Selection'] },
    course: { full_name:'Motion Lab', role:'Online motion design course', bio:'A practical course for designers who want to create animations for interfaces, ads, and social media.', smart_fill:'Online motion design course for beginners.', cta_label:'Join the course', cta_url:'https://example.com/course', skills:['After Effects','Figma','Portfolio','Mentoring'] },
    event: { full_name:'Product Meetup Kyiv', role:'Product team meetup', bio:'One evening with talks, networking, and practical cases about launching digital products.', smart_fill:'An event for product teams and startups.', cta_label:'Reserve a seat', cta_url:'https://example.com/event', skills:['Talks','Networking','Workshops','Q&A'] },
    restaurant: { full_name:'Casa Verde', role:'Italian restaurant', bio:'Homemade pasta, seasonal products, wine, and a calm atmosphere for dinners with friends.', smart_fill:'Restaurant with menu, interior, reviews, and reservation.', cta_label:'Book a table', cta_url:'https://example.com/reserve', skills:['Pasta','Wine','Reservation','Delivery'] },
    agency: { full_name:'Bright Agency', role:'Marketing agency', bio:'We build a clear client acquisition system: strategy, creatives, performance, and reporting without noise.', smart_fill:'Marketing agency for small and medium businesses.', cta_label:'Discuss project', cta_url:'https://example.com/start', skills:['Strategy','Performance','Creative','CRM','Analytics'] },
    portfolio: { full_name:'Mira Sokolova', role:'3D Artist', bio:'I create stylized 3D scenes, characters, and product visualizations for games, ads, and presentations.', smart_fill:'3D artist portfolio with gallery and cases.', cta_label:'View works', cta_url:'https://example.com/portfolio', skills:['Blender','ZBrush','Substance','Lighting','Render'] },
    gallery: { full_name:'Frame Works', role:'Photo gallery and visual series', bio:'A minimal gallery for photo series, art projects, and visual research.', smart_fill:'Gallery for visual content.', cta_label:'Open gallery', cta_url:'https://example.com/gallery', skills:['Photo','Editorial','Retouch','Art Direction'] },
  },
};

const DEMO_BLOCK_ITEMS = {
  ru: {
    services: [{ name:'Стартовая страница', description:'Быстрая упаковка предложения: структура, дизайн и адаптивная верстка.', price:'от $700', icon:'Layout' }, { name:'Редизайн сайта', description:'Обновление визуального языка, UX и конверсии без потери текущего контента.', price:'от $1200', icon:'Refresh' }],
    packages: [{ name:'Базовый', price:'$700', description:'Один экран, форма заявки, адаптив и базовая аналитика.' }, { name:'Премиум', price:'$1900', description:'Полная посадочная страница, тексты, анимации, SEO и интеграции.' }],
    process: [{ name:'Бриф', description:'Собираем цели, аудиторию и материалы.' }, { name:'Запуск', description:'Публикуем сайт, проверяем формы и аналитику.' }],
    testimonials: [{ name:'Ольга Романова', company:'Nova Clinic', rating:'5/5', text:'Страница стала понятнее, заявки начали приходить уже в первую неделю.' }, { name:'Дмитрий Левченко', company:'Indie Studio', rating:'5/5', text:'Быстро собрали структуру и визуал, который не выглядит шаблонно.' }],
    faq: [{ question:'Сколько занимает запуск?', answer:'Обычно первая рабочая версия готова за 5-10 дней. Срок зависит от объема блоков.' }, { question:'Можно ли потом редактировать сайт?', answer:'Да, вы можете вернуться в конструктор, поменять контент и сгенерировать обновленную версию.' }],
    team: [{ name:'Анна', role:'Project Manager', description:'Ведет коммуникацию, сроки и согласования.' }, { name:'Максим', role:'Designer', description:'Отвечает за визуальную систему и UX.' }],
    partners: [{ name:'Acme', url:'https://example.com' }, { name:'North Studio', url:'https://example.com' }],
    gallery: [{ title:'Главный визуал', description:'Изображение или работа, которая задает настроение.' }, { title:'Детали проекта', description:'Дополнительный кадр, процесс или фрагмент результата.' }],
    video: [{ title:'Короткое видео', youtube_url:'https://youtu.be/dQw4w9WgXcQ', description:'Мини-просмотр помогает быстро понять продукт или экспертизу.' }],
    stats: [{ value:'100+', label:'клиентов', description:'Работа с малым бизнесом и командами.' }, { value:'5 лет', label:'опыта', description:'Практика в digital-проектах.' }],
    timer: [{ title:'До конца акции', date:'2026-12-31', description:'Показывает срочность для предложения или события.' }],
    map: [{ address:'Kyiv, Ukraine' }],
    calculator: [{ name:'Базовая страница', price:'1x', description:'Один экран или простая услуга.' }, { name:'Дополнительный раздел', price:'+20%', description:'Услуги, отзывы, FAQ или галерея.' }],
    menu: [{ category:'Паста', name:'Pasta Verde', description:'Домашняя паста с базиликом и пармезаном.', price:'$14' }, { category:'Десерты', name:'Tiramisu', description:'Классический десерт с мягким кремом.', price:'$7' }],
    program: [{ name:'Модуль 1. Основа', description:'Разбираем инструменты, структуру и первые практические задания.', duration:'2 часа' }, { name:'Модуль 2. Практика', description:'Собираем проект для портфолио и получаем обратную связь.', duration:'4 часа' }],
    specs: [{ name:'Мощность', value:'2.5 кВт' }, { name:'Гарантия', value:'24 месяца' }],
    comparison: [{ name:'Базовая модель', description:'Для одной комнаты и стандартного монтажа.', price:'$499' }, { name:'Pro модель', description:'Тише, мощнее, с управлением через приложение.', price:'$799' }],
    form: [{ name:'Имя', type:'text', required:'yes' }, { name:'Телефон', type:'phone', required:'yes' }],
  },
  uk: {
    services: [{ name:'Стартова сторінка', description:'Швидке пакування пропозиції: структура, дизайн і адаптивна верстка.', price:'від $700', icon:'Layout' }, { name:'Редизайн сайту', description:'Оновлення візуальної мови, UX і конверсії без втрати поточного контенту.', price:'від $1200', icon:'Refresh' }],
    packages: [{ name:'Базовий', price:'$700', description:'Один екран, форма заявки, адаптив і базова аналітика.' }, { name:'Преміум', price:'$1900', description:'Повна посадкова сторінка, тексти, анімації, SEO та інтеграції.' }],
    process: [{ name:'Бриф', description:'Збираємо цілі, аудиторію та матеріали.' }, { name:'Запуск', description:'Публікуємо сайт, перевіряємо форми й аналітику.' }],
    testimonials: [{ name:'Ольга Романова', company:'Nova Clinic', rating:'5/5', text:'Сторінка стала зрозумілішою, заявки почали надходити вже першого тижня.' }, { name:'Дмитро Левченко', company:'Indie Studio', rating:'5/5', text:'Швидко зібрали структуру й візуал, який не виглядає шаблонно.' }],
    faq: [{ question:'Скільки триває запуск?', answer:'Зазвичай перша робоча версія готова за 5-10 днів. Термін залежить від обсягу блоків.' }, { question:'Чи можна потім редагувати сайт?', answer:'Так, ви можете повернутися в конструктор, змінити контент і згенерувати оновлену версію.' }],
    team: [{ name:'Анна', role:'Project Manager', description:'Веде комунікацію, строки та погодження.' }, { name:'Максим', role:'Designer', description:'Відповідає за візуальну систему та UX.' }],
    partners: [{ name:'Acme', url:'https://example.com' }, { name:'North Studio', url:'https://example.com' }],
    gallery: [{ title:'Головний візуал', description:'Зображення або робота, яка задає настрій.' }, { title:'Деталі проєкту', description:'Додатковий кадр, процес або фрагмент результату.' }],
    video: [{ title:'Коротке відео', youtube_url:'https://youtu.be/dQw4w9WgXcQ', description:'Мініперегляд допомагає швидко зрозуміти продукт або експертизу.' }],
    stats: [{ value:'100+', label:'клієнтів', description:'Робота з малим бізнесом і командами.' }, { value:'5 років', label:'досвіду', description:'Практика в digital-проєктах.' }],
    timer: [{ title:'До кінця акції', date:'2026-12-31', description:'Показує терміновість для пропозиції або події.' }],
    map: [{ address:'Kyiv, Ukraine' }],
    calculator: [{ name:'Базова сторінка', price:'1x', description:'Один екран або проста послуга.' }, { name:'Додатковий розділ', price:'+20%', description:'Послуги, відгуки, FAQ або галерея.' }],
    menu: [{ category:'Паста', name:'Pasta Verde', description:'Домашня паста з базиліком і пармезаном.', price:'$14' }, { category:'Десерти', name:'Tiramisu', description:'Класичний десерт із ніжним кремом.', price:'$7' }],
    program: [{ name:'Модуль 1. Основа', description:'Розбираємо інструменти, структуру та перші практичні завдання.', duration:'2 години' }, { name:'Модуль 2. Практика', description:'Збираємо проєкт для портфоліо й отримуємо зворотний зв’язок.', duration:'4 години' }],
    specs: [{ name:'Потужність', value:'2.5 кВт' }, { name:'Гарантія', value:'24 місяці' }],
    comparison: [{ name:'Базова модель', description:'Для однієї кімнати та стандартного монтажу.', price:'$499' }, { name:'Pro модель', description:'Тихіша, потужніша, з керуванням через застосунок.', price:'$799' }],
    form: [{ name:'Ім’я', type:'text', required:'yes' }, { name:'Телефон', type:'phone', required:'yes' }],
  },
  en: {
    services: [{ name:'Starter page', description:'Fast offer packaging: structure, design, and responsive layout.', price:'from $700', icon:'Layout' }, { name:'Website redesign', description:'Updated visual language, UX, and conversion without losing current content.', price:'from $1200', icon:'Refresh' }],
    packages: [{ name:'Basic', price:'$700', description:'One screen, request form, responsive layout, and basic analytics.' }, { name:'Premium', price:'$1900', description:'Full landing page, copy, animations, SEO, and integrations.' }],
    process: [{ name:'Brief', description:'We collect goals, audience, and materials.' }, { name:'Launch', description:'We publish the site and test forms and analytics.' }],
    testimonials: [{ name:'Olha Romanova', company:'Nova Clinic', rating:'5/5', text:'The page became clearer, and requests started arriving in the first week.' }, { name:'Dmytro Levchenko', company:'Indie Studio', rating:'5/5', text:'They quickly built a structure and visual style that does not feel template-based.' }],
    faq: [{ question:'How long does launch take?', answer:'The first working version is usually ready in 5-10 days. Timing depends on block volume.' }, { question:'Can I edit the site later?', answer:'Yes, you can return to the builder, update content, and generate a new version.' }],
    team: [{ name:'Anna', role:'Project Manager', description:'Handles communication, timing, and approvals.' }, { name:'Max', role:'Designer', description:'Owns the visual system and UX.' }],
    partners: [{ name:'Acme', url:'https://example.com' }, { name:'North Studio', url:'https://example.com' }],
    gallery: [{ title:'Main visual', description:'An image or work sample that sets the mood.' }, { title:'Project details', description:'An additional frame, process shot, or result fragment.' }],
    video: [{ title:'Short video', youtube_url:'https://youtu.be/dQw4w9WgXcQ', description:'A mini preview helps users understand the product or expertise quickly.' }],
    stats: [{ value:'100+', label:'clients', description:'Work with small businesses and teams.' }, { value:'5 years', label:'experience', description:'Practice in digital projects.' }],
    timer: [{ title:'Promotion ends', date:'2026-12-31', description:'Shows urgency for an offer or event.' }],
    map: [{ address:'Kyiv, Ukraine' }],
    calculator: [{ name:'Basic page', price:'1x', description:'One screen or a simple service.' }, { name:'Additional section', price:'+20%', description:'Services, testimonials, FAQ, or gallery.' }],
    menu: [{ category:'Pasta', name:'Pasta Verde', description:'Homemade pasta with basil and parmesan.', price:'$14' }, { category:'Desserts', name:'Tiramisu', description:'Classic dessert with soft cream.', price:'$7' }],
    program: [{ name:'Module 1. Basics', description:'We cover tools, structure, and first practical tasks.', duration:'2 hours' }, { name:'Module 2. Practice', description:'We build a portfolio project and receive feedback.', duration:'4 hours' }],
    specs: [{ name:'Power', value:'2.5 kW' }, { name:'Warranty', value:'24 months' }],
    comparison: [{ name:'Basic model', description:'For one room and standard installation.', price:'$499' }, { name:'Pro model', description:'Quieter, more powerful, with app control.', price:'$799' }],
    form: [{ name:'Name', type:'text', required:'yes' }, { name:'Phone', type:'phone', required:'yes' }],
  },
};

// ── reusable styled pieces ────────────────────────────────────────────────────
const S = {
  input: {
    background:'#1a1a24', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px',
    color:'#f0ede8', fontFamily:'DM Sans, sans-serif', fontSize:'14px',
    padding:'10px 12px', outline:'none', width:'100%', transition:'border-color 0.2s',
  },
  label: { fontSize:'12px', color:'#888', display:'block', marginBottom:'5px' },
  section: {
    fontFamily:'DM Mono, monospace', fontSize:'10px', letterSpacing:'2px',
    color:'#555', textTransform:'uppercase', paddingBottom:'8px',
    borderBottom:'1px solid rgba(255,255,255,0.06)', marginTop:'8px',
  },
  card: {
    background:'#1a1a24', border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:'12px', padding:'1rem',
  },
};

export default function CardForm({ initialData = {}, onSave, onGenerate, isSaving, isGenerating, previewHTML }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    full_name: '', role: '', bio: '', email: '', phone: '',
    city: '', github: '', telegram: '', linkedin: '',
    skills: [], theme: 'dark-neon', layout: 'centered', sphere: 'developer',
    design_settings: DEFAULT_DESIGN,
    content_blocks: [],
    ...initialData,
    layout: LAYOUTS.includes(initialData.layout) ? initialData.layout : 'centered',
    design_settings: { ...DEFAULT_DESIGN, ...(initialData.design_settings || {}) },
    content_blocks: normalizeInitialContentBlocks(initialData.content_blocks),
  });
  const [builderStep, setBuilderStep] = useState(initialData.id ? 2 : 0);
  const [projects, setProjects] = useState(initialData.projects || []);
  const [skillInput, setSkillInput] = useState('');
  const [previewTab, setPreviewTab] = useState('preview');
  const [projectModal, setProjectModal] = useState(null); // null | 'new' | {project obj}
  const [modalData, setModalData] = useState({ name:'', description:'', link_label:'', link_url:'', bg_image: null, bg_preview: null });
  const [draggingSection, setDraggingSection] = useState(null);
  const fileRefs = useRef({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const updateDesign = (patch) => setForm(f => ({ ...f, design_settings: { ...DEFAULT_DESIGN, ...(f.design_settings || {}), ...patch } }));
  const setDesign = (key, val) => updateDesign({ [key]: val });
  const design = { ...DEFAULT_DESIGN, ...(form.design_settings || {}) };
  const templateBlocks = TEMPLATE_BLOCKS[design.template_kind] || TEMPLATE_BLOCKS.specialist;
  const enabledBlocks = normalizeEnabledBlocks(design.enabled_blocks, templateBlocks);
  const sectionOrder = normalizeSectionOrder(design.section_order, enabledBlocks);
  const contentBlocks = normalizeContentBlocks(form.content_blocks, enabledBlocks);
  const socialLinks = Array.isArray(design.social_links) ? design.social_links : [];
  const setCustomTheme = () => set('theme', 'custom');
  // Skills
  const addSkill = (s) => {
    const v = (s || skillInput).trim();
    if (!v || form.skills.includes(v)) return;
    set('skills', [...form.skills, v]);
    setSkillInput('');
  };
  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s));
  const togglePreset = (s) => form.skills.includes(s) ? removeSkill(s) : addSkill(s);

  // Project modal
  const openNewProject = () => {
    setModalData({ name:'', description:'', link_label:t('builder.view_label'), link_url:'', bg_image: null, bg_preview: null });
    setProjectModal('new');
  };
  const openEditProject = (p) => {
    setModalData({ ...p, bg_image: null, bg_preview: p.bg_image_url || null });
    setProjectModal(p);
  };
  const handleModalImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setModalData(d => ({ ...d, bg_image: file, bg_preview: ev.target.result }));
    reader.readAsDataURL(file);
  };
  const saveProject = () => {
    if (!modalData.name.trim()) return;
    if (projectModal === 'new') {
      setProjects(p => [...p, { ...modalData, id: Date.now() }]);
    } else {
      setProjects(p => p.map(x => x.id === projectModal.id ? { ...x, ...modalData } : x));
    }
    setProjectModal(null);
  };
  const deleteProject = (id) => setProjects(p => p.filter(x => x.id !== id));

  const setSectionOrder = (order) => setDesign('section_order', normalizeSectionOrder(order, enabledBlocks));
  const updateContentBlock = (type, patch) => setForm(f => {
    const blocks = normalizeContentBlocks(f.content_blocks, enabledBlocks);
    const existing = blocks.find(block => block.type === type) || createDefaultContentBlock(type);
    const nextBlock = { ...existing, ...patch };
    return {
      ...f,
      content_blocks: [...blocks.filter(block => block.type !== type), nextBlock],
    };
  });
  const moveSection = (from, to) => {
    if (from === to || from < 0 || to < 0) return;
    const next = [...sectionOrder];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setSectionOrder(next);
  };
  const handleSectionDrop = (targetKey) => {
    if (!draggingSection) return;
    moveSection(sectionOrder.indexOf(draggingSection), sectionOrder.indexOf(targetKey));
    setDraggingSection(null);
  };
  const selectTemplateKind = (kind) => {
    const nextBlocks = TEMPLATE_BLOCKS[kind] || TEMPLATE_BLOCKS.specialist;
    const nextEnabled = nextBlocks.slice(0, Math.min(nextBlocks.length, 5));
    const mustHaveContacts = nextEnabled.includes('contacts') ? nextEnabled : [...nextEnabled, 'contacts'];
    setForm(f => ({
      ...f,
      sphere: kind,
      design_settings: {
        ...DEFAULT_DESIGN,
        ...(f.design_settings || {}),
        template_kind: kind,
        enabled_blocks: mustHaveContacts,
        section_order: mustHaveContacts,
      },
      content_blocks: [],
    }));
  };
  const toggleTemplateBlock = (key) => {
    if (key === 'contacts') return;
    const nextEnabled = enabledBlocks.includes(key)
      ? enabledBlocks.filter(item => item !== key)
      : [...enabledBlocks, key];
    const normalized = nextEnabled.includes('contacts') ? nextEnabled : [...nextEnabled, 'contacts'];
    setForm(f => ({
      ...f,
      design_settings: {
        ...DEFAULT_DESIGN,
        ...(f.design_settings || {}),
        enabled_blocks: normalized,
        section_order: normalizeSectionOrder(f.design_settings?.section_order || [], normalized),
      },
      content_blocks: normalizeContentBlocks(f.content_blocks, normalized),
    }));
  };
  const updateSocialLinks = (updater) => setDesign('social_links', typeof updater === 'function' ? updater(socialLinks) : updater);
  const addSocialLink = () => updateSocialLinks(list => [...list, { id:`social-${Date.now()}`, platform:'Instagram', label:'Instagram', url:'' }]);
  const updateSocialLink = (id, patch) => updateSocialLinks(list => list.map(item => item.id === id ? { ...item, ...patch } : item));
  const removeSocialLink = (id) => updateSocialLinks(list => list.filter(item => item.id !== id));
  const updateGradient = (patch) => {
    const next = { ...design, ...patch };
    updateDesign({ ...patch, gradient: buildGradient(next) });
    setCustomTheme();
  };
  const applyGradientPreset = (preset) => {
    const next = {
      gradient_angle: preset.angle,
      gradient_from: preset.from,
      gradient_via: preset.via,
      gradient_to: preset.to,
    };
    updateDesign({ ...next, gradient: buildGradient({ ...design, ...next }) });
    setCustomTheme();
  };
  const uploadDesignImage = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => updateDesign({
      [key]: event.target.result,
      [`${key}_name`]: file.name,
    });
    reader.readAsDataURL(file);
  };
  const applyLazyAutofill = () => {
    const locale = getLanguageKey(i18n.resolvedLanguage || i18n.language);
    const localePresets = DEMO_PRESETS[locale] || DEMO_PRESETS.uk;
    const fallbackPresets = DEMO_PRESETS.uk;
    const preset = localePresets[design.template_kind] || localePresets.specialist || fallbackPresets.specialist;
    const fallbackPreset = fallbackPresets.specialist;
    const demoBlocks = contentBlocks.map(block => createDemoContentBlock(block.type, t, locale));
    const demoProjects = (preset.projects || fallbackPreset.projects).map(([name, description], index) => ({
      id: Date.now() + index,
      name,
      description,
      link_label: t('builder.view_label'),
      link_url: `https://example.com/project-${index + 1}`,
      bg_image: null,
      bg_preview: null,
      _new: true,
    }));
    setForm(f => ({
      ...f,
      full_name: f.full_name || preset.full_name,
      role: f.role || preset.role,
      bio: f.bio || preset.bio,
      email: f.email || 'hello@example.com',
      phone: f.phone || '+380 99 123-45-67',
      city: f.city || 'Kyiv',
      github: f.github || 'example.com',
      telegram: f.telegram || '@cardforge_demo',
      linkedin: f.linkedin || 'linkedin.com/in/cardforge-demo',
      skills: (f.skills || []).length ? f.skills : preset.skills,
      design_settings: {
        ...DEFAULT_DESIGN,
        ...(f.design_settings || {}),
        smart_fill: f.design_settings?.smart_fill || preset.smart_fill,
        primary_link_label: !f.design_settings?.primary_link_label || DEFAULT_GO_LABELS.includes(f.design_settings.primary_link_label)
          ? preset.cta_label
          : f.design_settings.primary_link_label,
        primary_link_url: f.design_settings?.primary_link_url || preset.cta_url,
        social_links: Array.isArray(f.design_settings?.social_links) && f.design_settings.social_links.length
          ? f.design_settings.social_links
          : [
              { id:`social-demo-instagram`, platform:'Instagram', label:'Instagram', url:'@cardforge.demo' },
              { id:`social-demo-telegram`, platform:'Telegram', label:'Telegram', url:'@cardforge_demo' },
            ],
      },
      content_blocks: demoBlocks,
    }));
    setProjects(current => current.length ? current : demoProjects);
  };

  useEffect(() => {
    const handler = (event) => {
      const saved = event.detail || [];
      if (!Array.isArray(saved) || saved.length === 0) return;
      setProjects(current => current.map(project => {
        const match = saved.find(item => item.localId === project.id);
        if (!match) return project;
        return {
          ...project,
          ...match.savedProject,
          _saved: true,
          _new: false,
          bg_preview: project.bg_preview || match.savedProject.bg_image_url || null,
          bg_image: null,
        };
      }));
    };
    window.addEventListener('cardforge:projects-saved', handler);
    return () => window.removeEventListener('cardforge:projects-saved', handler);
  }, []);

  const payloadForm = { ...form, content_blocks: contentBlocks, design_settings: { ...design, enabled_blocks: enabledBlocks, section_order: sectionOrder, social_links: socialLinks } };
  const handleSubmit = () => onSave && onSave(payloadForm, projects);
  const handleGenerate = () => onGenerate && onGenerate(payloadForm, projects);

  // Download HTML
  const downloadHTML = () => {
    if (!previewHTML) return;
    const blob = new Blob([previewHTML], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(form.full_name || 'vizitka').replace(/\s+/g,'-').toLowerCase()}.html`;
    a.click();
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'400px 1fr', gap:'1.5rem', alignItems:'start' }}>

      {/* ── LEFT: FORM ──────────────────────────────────────────────── */}
      <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'18px', overflow:'hidden', position:'sticky', top:'80px' }}>

        {/* Header */}
        <div style={{ padding:'1.2rem 1.4rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:30, height:30, background:'#e8ff47', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0a0a0f' }}><Brush size={16} /></div>
          <div>
            <div style={{ fontSize:'13px', fontWeight:600 }}>{t('form.section_personal')}</div>
            <div style={{ fontSize:'11px', color:'#555' }}>{t('builder.header_hint')}</div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ padding:'1.2rem', display:'flex', flexDirection:'column', gap:'1rem', maxHeight:'calc(100vh - 260px)', overflowY:'auto' }}>

          <WizardSteps step={builderStep} />

          {builderStep === 0 && (
            <>
              <div style={S.section}>{t('builder.step_niche_title')}</div>
              <div style={{ color:'#777', fontSize:12, lineHeight:1.55 }}>
                {t('builder.step_niche_desc')}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px' }}>
                {NICHES.map(item => {
                  const Icon = item.icon;
                  const active = design.template_kind === item.value;
                  return (
                    <button key={item.value} onClick={() => selectTemplateKind(item.value)} style={{
                      background:active ? 'rgba(232,255,71,0.1)' : 'rgba(255,255,255,0.04)',
                      border:`1px solid ${active ? 'rgba(232,255,71,0.42)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius:10, padding:'12px 10px', color:active ? design.accent : '#888',
                      cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:13,
                      textAlign:'left',
                    }}>
                      <Icon size={16} />
                      <span>{t(`niches.${item.value}`)}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {builderStep === 1 && (
            <>
              <div style={S.section}>{t('builder.step_design_title')}</div>
              <Field label={t('form.theme')}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px' }}>
                  {THEMES.map(th => (
                    <button key={th} onClick={() => set('theme', th)} title={t(`themes.${th}`)} style={{
                      aspectRatio:'1', borderRadius:'8px', cursor:'pointer', border:`2px solid ${form.theme === th ? '#e8ff47' : 'transparent'}`,
                      background: THEME_GRADIENTS[th], position:'relative', overflow:'hidden',
                      transform: form.theme === th ? 'scale(0.88)' : 'scale(1)', transition:'all 0.15s',
                    }}>
                      <span style={{ position:'absolute', bottom:3, left:0, right:0, textAlign:'center', fontSize:'8px', color:'rgba(255,255,255,0.7)', fontWeight:500 }}>
                        {t(`themes.${th}`).split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={t('form.layout')}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px' }}>
                  {LAYOUTS.map(lay => (
                    <button key={lay} onClick={() => set('layout', lay)} style={{
                      background: form.layout === lay ? 'rgba(232,255,71,0.08)' : 'rgba(255,255,255,0.03)',
                      border:`1px solid ${form.layout === lay ? 'rgba(232,255,71,0.4)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius:'10px', padding:'10px', cursor:'pointer', textAlign:'left',
                      color: form.layout === lay ? '#e8ff47' : '#666',
                      fontSize:'11px', transition:'all 0.15s',
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, color:form.layout === lay ? '#e8ff47' : '#999', marginBottom:5 }}>
                        {React.createElement(LAYOUT_ICONS[lay], { size:17 })}
                        <strong>{t(`layouts.${lay}`)}</strong>
                      </div>
                      <span style={{ color:'#666', lineHeight:1.35 }}>{t(`layout_details.${lay}`, { defaultValue: LAYOUT_DETAILS[lay] })}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <ColorControl label={t('builder.colors.background')} value={design.background} onChange={v => { setDesign('background', v); setCustomTheme(); }} />
                <ColorControl label={t('builder.colors.surface')} value={design.surface} onChange={v => { setDesign('surface', v); setCustomTheme(); }} />
                <ColorControl label={t('builder.colors.accent')} value={design.accent} onChange={v => { setDesign('accent', v); setCustomTheme(); }} />
                <ColorControl label={t('builder.colors.text')} value={design.text} onChange={v => { setDesign('text', v); setCustomTheme(); }} />
              </div>
              <div style={{ ...S.card, display:'grid', gap:10 }}>
                <div style={{ ...S.section, marginTop:0 }}>{t('builder.gradient.title')}</div>
                <div style={{ height:54, borderRadius:12, background:design.gradient, border:'1px solid rgba(255,255,255,0.08)' }} />
                <Field label={`${t('builder.gradient.angle')}: ${design.gradient_angle || 135}deg`}>
                  <input type="range" min="0" max="360" value={design.gradient_angle || 135} onChange={e => updateGradient({ gradient_angle:Number(e.target.value) })} />
                </Field>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
                  <ColorControl label={t('builder.gradient.from')} value={design.gradient_from} onChange={v => updateGradient({ gradient_from:v })} />
                  <ColorControl label={t('builder.gradient.via')} value={design.gradient_via} onChange={v => updateGradient({ gradient_via:v })} />
                  <ColorControl label={t('builder.gradient.to')} value={design.gradient_to} onChange={v => updateGradient({ gradient_to:v })} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'6px' }}>
                  {GRADIENT_PRESETS.map((preset, index) => {
                    const gradient = buildGradient({
                      gradient_angle:preset.angle,
                      gradient_from:preset.from,
                      gradient_via:preset.via,
                      gradient_to:preset.to,
                    });
                    return (
                      <button
                        key={`${preset.from}-${preset.to}-${index}`}
                        onClick={() => applyGradientPreset(preset)}
                        title={gradient}
                        style={{ height:30, borderRadius:8, border:`2px solid ${design.gradient === gradient ? design.accent : 'transparent'}`, background:gradient, cursor:'pointer' }}
                      />
                    );
                  })}
                </div>
                <Field label={t('builder.gradient.css')}>
                  <input
                    style={S.input}
                    value={design.gradient}
                    onChange={e => { setDesign('gradient', e.target.value); setCustomTheme(); }}
                    placeholder="linear-gradient(135deg,#0a0a0f,#e8ff47)"
                  />
                </Field>
              </div>
              {form.layout === 'split-showcase' && (
                <Field label={t('builder.split_logo')}>
                  <MediaUpload
                    value={design.split_logo}
                    fileName={design.split_logo_name}
                    onChange={file => uploadDesignImage('split_logo', file)}
                    onClear={() => updateDesign({ split_logo:'', split_logo_name:'' })}
                    label={t('builder.upload_logo')}
                  />
                </Field>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <Field label={`${t('builder.radius')}: ${design.radius}px`}>
                  <input type="range" min="0" max="36" value={design.radius} onChange={e => setDesign('radius', Number(e.target.value))} />
                </Field>
                <Field label={t('builder.density')}>
                  <select style={{ ...S.input, cursor:'pointer' }} value={design.density} onChange={e => setDesign('density', e.target.value)}>
                    <option value="comfortable">{t('builder.density_comfortable')}</option>
                    <option value="compact">{t('builder.density_compact')}</option>
                  </select>
                </Field>
              </div>
            </>
          )}

          {builderStep === 2 && (
            <>
              <div style={S.section}>{t('builder.step_content_title')}</div>
              <Field label={t('builder.smart_fill')}>
                <input
                  style={S.input}
                  value={design.smart_fill || ''}
                  onChange={e => setDesign('smart_fill', e.target.value)}
                  placeholder={t('builder.smart_fill_placeholder')}
                />
              </Field>
              <button onClick={applyLazyAutofill} style={{
                background:'rgba(232,255,71,0.1)',
                border:'1px solid rgba(232,255,71,0.28)',
                borderRadius:10,
                color:'#e8ff47',
                padding:'10px 12px',
                cursor:'pointer',
                display:'inline-flex',
                alignItems:'center',
                justifyContent:'center',
                gap:8,
                fontFamily:'DM Sans, sans-serif',
                fontSize:13,
                fontWeight:700,
              }}>
                <Sparkles size={15} /> {t('builder.autofill')}
              </button>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <Field label={t('builder.primary_link_label')}>
                  <input style={S.input} value={design.primary_link_label || ''} onChange={e => setDesign('primary_link_label', e.target.value)} placeholder={t('builder.primary_link_placeholder')} />
                </Field>
                <Field label={t('builder.primary_link_url')}>
                  <input style={S.input} value={design.primary_link_url || ''} onChange={e => setDesign('primary_link_url', e.target.value)} placeholder="https://..." />
                </Field>
              </div>

              <div style={S.section}>{t('builder.required_hero')}</div>
              <Field label={t('form.name')}>
                <input style={S.input} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder={t('builder.name_placeholder')} />
              </Field>
              <Field label={t('form.role')}>
                <input style={S.input} value={form.role} onChange={e => set('role', e.target.value)} placeholder={t('builder.role_placeholder')} />
              </Field>
              <Field label={t('builder.hero_text')}>
                <textarea style={{ ...S.input, minHeight:80, maxHeight:200, overflowY:'auto', resize:'none', lineHeight:1.6 }} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder={t('builder.hero_text_placeholder')} />
              </Field>

              <div style={S.section}>{t('builder.optional_blocks')}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'6px' }}>
                {templateBlocks.map(key => {
                  const item = SECTION_CONFIG[key] || { label:key, icon:Layers };
                  const Icon = item.icon;
                  const active = enabledBlocks.includes(key);
                  return (
                    <button key={key} onClick={() => toggleTemplateBlock(key)} disabled={key === 'contacts'} style={{
                      background:active ? 'rgba(232,255,71,0.1)' : 'rgba(255,255,255,0.04)',
                      border:`1px solid ${active ? 'rgba(232,255,71,0.42)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius:9, padding:'9px 8px', color:active ? design.accent : '#777',
                      cursor:key === 'contacts' ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:'7px',
                      fontSize:12, textAlign:'left', opacity:key === 'contacts' ? 0.78 : 1,
                    }}>
                      <Icon size={15} />
                      <span>{t(`sections.${key}`, { defaultValue: item.label })}</span>
                    </button>
                  );
                })}
              </div>

              <Field label={t('builder.section_order')}>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {sectionOrder.map((key, index) => {
                    const item = SECTION_CONFIG[key] || { label:key, icon:Layers };
                    const Icon = item.icon;
                    return (
                      <div key={key} draggable onDragStart={() => setDraggingSection(key)} onDragOver={e => e.preventDefault()} onDrop={() => handleSectionDrop(key)} onDragEnd={() => setDraggingSection(null)} style={{
                        display:'grid', gridTemplateColumns:'24px 1fr 58px', alignItems:'center', gap:'8px',
                        background:draggingSection === key ? 'rgba(232,255,71,0.08)' : 'rgba(255,255,255,0.04)',
                        border:`1px solid ${draggingSection === key ? 'rgba(232,255,71,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius:10, padding:'8px', color:'#aaa', cursor:'grab',
                      }}>
                        <GripVertical size={16} />
                        <div style={{ display:'flex', alignItems:'center', gap:'7px', minWidth:0 }}>
                          <Icon size={15} color={design.accent} />
                          <span style={{ fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t(`sections.${key}`, { defaultValue: item.label })}</span>
                        </div>
                        <div style={{ display:'flex', gap:4 }}>
                          <button onClick={() => moveSection(index, index - 1)} disabled={index === 0} style={{ ...iconBtn, opacity:index === 0 ? 0.35 : 1 }} aria-label="Move section up"><ArrowUp size={12} /></button>
                          <button onClick={() => moveSection(index, index + 1)} disabled={index === sectionOrder.length - 1} style={{ ...iconBtn, opacity:index === sectionOrder.length - 1 ? 0.35 : 1 }} aria-label="Move section down"><ArrowDown size={12} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Field>

              <div style={S.section}>{t('form.section_contacts')} <span style={{ color:'#777' }}>({t('form.required').toLowerCase()})</span></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                {[['email',t('form.email'),'ivan@example.com'],['phone',t('form.phone'),'+380 99 123-45-67'],['city',t('form.city'),'Kyiv'],['github',t('form.github'),'github.com/user'],['telegram',t('form.telegram'),'@username'],['linkedin',t('form.linkedin'),'linkedin.com/in/user']].map(([k,l,ph]) => (
                  <Field key={k} label={l}><input type={k === 'email' ? 'email' : 'text'} style={S.input} value={form[k]} onChange={e => set(k,e.target.value)} placeholder={ph} /></Field>
                ))}
              </div>
              <SocialLinksEditor
                links={socialLinks}
                addSocialLink={addSocialLink}
                updateSocialLink={updateSocialLink}
                removeSocialLink={removeSocialLink}
              />

              {enabledBlocks.includes('skills') && (
                <TemplateSkillsEditor form={form} skillInput={skillInput} setSkillInput={setSkillInput} addSkill={addSkill} removeSkill={removeSkill} togglePreset={togglePreset} />
              )}

              {enabledBlocks.includes('projects') && (
                <TemplateProjectsEditor projects={projects} openNewProject={openNewProject} openEditProject={openEditProject} deleteProject={deleteProject} />
              )}

              {sectionOrder.filter(key => !['skills','projects','contacts'].includes(key)).map(key => (
                <TemplateBlockEditor
                  key={key}
                  blockKey={key}
                  data={contentBlocks.find(block => block.type === key) || createDefaultContentBlock(key)}
                  onChange={patch => updateContentBlock(key, patch)}
                />
              ))}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ padding:'1rem 1.2rem', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:'8px' }}>
          {builderStep > 0 && (
            <button onClick={() => setBuilderStep(step => Math.max(0, step - 1))} style={{
              flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:'10px', color:'#888', padding:'11px', cursor:'pointer',
              fontFamily:'DM Sans, sans-serif', fontSize:'13px',
            }}>
              {t('builder.back')}
            </button>
          )}
          {builderStep < 2 ? (
            <button onClick={() => setBuilderStep(step => Math.min(2, step + 1))} style={{
              flex:2, background:'#e8ff47', border:'none', borderRadius:'10px', color:'#0a0a0f',
              padding:'11px', cursor:'pointer', fontFamily:"'Bebas Neue', sans-serif",
              fontSize:'1rem', letterSpacing:'2px',
            }}>
              {builderStep === 0 ? t('builder.next_design') : t('builder.next_content')}
            </button>
          ) : (
            <>
              <button onClick={handleSubmit} disabled={isSaving} style={{
                flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:'10px', color:'#f0ede8', padding:'11px', cursor: isSaving ? 'not-allowed' : 'pointer',
                fontFamily:'DM Sans, sans-serif', fontSize:'13px', fontWeight:500, opacity: isSaving ? 0.6 : 1,
                display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
              }}>
                {isSaving ? t('form.saving') : <><Save size={15} /> {t('form.save_btn')}</>}
              </button>
              <button onClick={handleGenerate} disabled={isGenerating} style={{
                flex:2, background: isGenerating ? 'rgba(232,255,71,0.5)' : '#e8ff47',
                border:'none', borderRadius:'10px', color:'#0a0a0f', padding:'11px',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', letterSpacing:'2px',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              }}>
                {isGenerating ? (
                  <>
                    <span style={{ width:14, height:14, border:'2px solid rgba(10,10,15,0.3)', borderTopColor:'#0a0a0f', borderRadius:'50%', display:'inline-block', animation:'spin 0.6s linear infinite' }} />
                    {t('form.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    {t('form.generate_btn')}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT: PREVIEW ──────────────────────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {/* Toolbar */}
        <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
          <div style={{ display:'flex', gap:'4px', background:'#1a1a24', borderRadius:'8px', padding:'3px' }}>
            {[['preview', t('preview.tabs_preview'), MonitorSmartphone], ['code', t('preview.tabs_code'), FileText], ['mobile', t('preview.tabs_mobile'), Smartphone]].map(([k,l,Icon]) => (
              <button key={k} onClick={() => setPreviewTab(k)} style={{
                padding:'5px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:500,
                background: previewTab === k ? '#e8ff47' : 'transparent',
                color: previewTab === k ? '#0a0a0f' : '#666',
                border:'none', transition:'all 0.15s', fontFamily:'DM Sans, sans-serif',
                display:'inline-flex', alignItems:'center', gap:'6px',
              }}><Icon size={14} />{l}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:'6px' }}>
            <SmallBtn onClick={() => { if(previewHTML){ navigator.clipboard.writeText(previewHTML); } }}>
              <Clipboard size={14} /> {t('preview.copy_code')}
            </SmallBtn>
            <SmallBtn onClick={downloadHTML} accent>
              <Download size={14} /> {t('preview.download')}
            </SmallBtn>
          </div>
        </div>

        {/* Frame */}
        <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'18px', overflow:'hidden', minHeight:580 }}>
          {/* Browser bar */}
          <div style={{ background:'#1a1a24', padding:'9px 14px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display:'flex', gap:'5px' }}>
              {['#ff5f56','#ffbd2e','#27c93f'].map(c => <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }} />)}
            </div>
            <div style={{ flex:1, background:'#0a0a0f', borderRadius:'5px', padding:'3px 12px', fontFamily:'DM Mono, monospace', fontSize:'11px', color:'#555' }}>
              {previewHTML ? `cardforge.app/c/${(form.full_name||'preview').toLowerCase().replace(/\s+/g,'-').slice(0,20)}` : 'cardforge.app/preview'}
            </div>
          </div>

          {!previewHTML ? (
            <LocalDraftPreview
              form={form}
              projects={projects}
              design={design}
              sectionOrder={sectionOrder}
              contentBlocks={contentBlocks}
              mobile={previewTab === 'mobile'}
            />
          ) : previewTab === 'code' ? (
            <div style={{ background:'#0a0a0f', padding:'1.5rem', overflowX:'auto', maxHeight:560, overflowY:'auto' }}>
              <pre style={{ fontFamily:'DM Mono, monospace', fontSize:'12px', lineHeight:1.7, color:'#abb2bf', whiteSpace:'pre-wrap', wordBreak:'break-all', margin:0 }}>
                {previewHTML}
              </pre>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={previewHTML.slice(0,40)}
                initial={{ opacity:0, y:12 }}
                animate={{ opacity:1, y:0 }}
                transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
              >
                <iframe
                  srcDoc={previewHTML}
                  style={{
                    width: previewTab === 'mobile' ? '375px' : '100%',
                    margin: previewTab === 'mobile' ? '0 auto' : '0',
                    display: 'block',
                    border:'none',
                    minHeight: 540,
                  }}
                  title="preview"
                  onLoad={e => {
                    try {
                      const h = e.target.contentDocument?.documentElement?.scrollHeight;
                      if (h) e.target.style.height = h + 'px';
                    } catch {}
                  }}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── PROJECT MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {projectModal !== null && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setProjectModal(null)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          >
            <motion.div
              initial={{ scale:0.93, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.93 }}
              transition={{ type:'spring', stiffness:400, damping:30 }}
              onClick={e => e.stopPropagation()}
              style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', padding:'2rem', width:'100%', maxWidth:460, display:'flex', flexDirection:'column', gap:'1rem' }}
            >
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h3 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:'2px' }}>
                  {projectModal === 'new' ? t('builder.project_new') : t('builder.project_edit')}
                </h3>
                <button onClick={() => setProjectModal(null)} aria-label="Close" style={{ ...iconBtn, fontSize:'16px' }}><X size={15} /></button>
              </div>

              <Field label={t('form.project_name')}>
                <input style={S.input} value={modalData.name} onChange={e => setModalData(d=>({...d,name:e.target.value}))} placeholder={t('builder.project_name_placeholder')} />
              </Field>
              <Field label={t('form.project_desc')}>
                <textarea style={{ ...S.input, minHeight:70, resize:'none' }} value={modalData.description} onChange={e => setModalData(d=>({...d,description:e.target.value}))} placeholder={t('builder.short_description_placeholder')} />
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <Field label={t('form.project_link_label')}>
                  <input style={S.input} value={modalData.link_label} onChange={e => setModalData(d=>({...d,link_label:e.target.value}))} placeholder={t('builder.view_label')} />
                </Field>
                <Field label={t('form.project_link_url')}>
                  <input type="url" style={S.input} value={modalData.link_url} onChange={e => setModalData(d=>({...d,link_url:e.target.value}))} placeholder="https://..." />
                </Field>
              </div>

              {/* Image upload */}
              <Field label={t('form.project_image')}>
                <div
                  onClick={() => document.getElementById('modal-img-input').click()}
                  style={{
                    border:'1.5px dashed rgba(255,255,255,0.15)', borderRadius:'10px',
                    minHeight:90, cursor:'pointer', overflow:'hidden', position:'relative',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'border-color 0.2s',
                  }}
                >
                  <input id="modal-img-input" type="file" accept="image/*" style={{ display:'none' }} onChange={handleModalImage} />
                  {modalData.bg_preview ? (
                    <>
                      <img src={modalData.bg_preview} alt="bg" style={{ width:'100%', height:100, objectFit:'cover', display:'block' }} />
                      <button
                        onClick={e => { e.stopPropagation(); setModalData(d=>({...d,bg_image:null,bg_preview:null})); document.getElementById('modal-img-input').value=''; }}
                        style={{ position:'absolute', top:6, right:6, background:'rgba(10,10,15,0.8)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'6px', color:'#f0ede8', width:24, height:24, cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center' }}
                      ><X size={13} /></button>
                    </>
                  ) : (
                    <div style={{ textAlign:'center', color:'#444', padding:'1rem', pointerEvents:'none' }}>
                      <div style={{ marginBottom:'4px', display:'flex', justifyContent:'center' }}><ImageIcon size={24} /></div>
                      <div style={{ fontSize:'12px' }}>{t('form.upload_image')}</div>
                      <div style={{ fontSize:'10px', marginTop:'2px', color:'#333', fontFamily:'DM Mono, monospace' }}>{t('form.upload_hint')}</div>
                    </div>
                  )}
                </div>
              </Field>

              {/* Preview of link */}
              {modalData.link_url && (
                <div style={{ background:'rgba(232,255,71,0.04)', border:'1px solid rgba(232,255,71,0.1)', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#e8ff47', fontFamily:'DM Mono, monospace', wordBreak:'break-all', display:'flex', gap:'6px', alignItems:'center' }}>
                  <LinkIcon size={12} /> {modalData.link_label || t('builder.view_label')} → {modalData.link_url}
                </div>
              )}

              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'4px' }}>
                <button onClick={() => setProjectModal(null)} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#666', padding:'9px 20px', cursor:'pointer', fontFamily:'DM Sans, sans-serif', fontSize:'13px' }}>
                  {t('builder.cancel')}
                </button>
                <button onClick={saveProject} style={{ background:'#e8ff47', border:'none', borderRadius:'8px', color:'#0a0a0f', padding:'9px 20px', cursor:'pointer', fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.95rem', letterSpacing:'1.5px' }}>
                  {t('builder.save_upper')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::-webkit-scrollbar, div::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-thumb, div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        input:focus, textarea:focus, select:focus { border-color: rgba(232,255,71,0.5) !important; }
        select option { background: #1a1a24; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
      {label && <label style={S.label}>{label}</label>}
      {children}
    </div>
  );
}

function WizardSteps({ step }) {
  const { t } = useTranslation();
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px', marginBottom:'4px' }}>
      {[t('builder.step_niche'), t('builder.step_design'), t('builder.step_content')].map((label, index) => (
        <div key={label} style={{
          borderRadius:9,
          padding:'8px 6px',
          textAlign:'center',
          fontSize:11,
          color:index === step ? '#0a0a0f' : '#777',
          background:index === step ? '#e8ff47' : 'rgba(255,255,255,0.04)',
          border:`1px solid ${index === step ? '#e8ff47' : 'rgba(255,255,255,0.08)'}`,
        }}>
          {index + 1}. {label}
        </div>
      ))}
    </div>
  );
}

function TemplateSkillsEditor({ form, skillInput, setSkillInput, addSkill, removeSkill, togglePreset }) {
  const { t } = useTranslation();
  return (
    <>
      <div style={S.section}>{t('sections.skills')}</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
        {PRESET_SKILLS.map(s => (
          <button key={s} onClick={() => togglePreset(s)} style={{
            padding:'4px 12px', borderRadius:'100px', fontSize:'12px', cursor:'pointer',
            background: form.skills.includes(s) ? 'rgba(232,255,71,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${form.skills.includes(s) ? 'rgba(232,255,71,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: form.skills.includes(s) ? '#e8ff47' : '#888',
          }}>{s}</button>
        ))}
      </div>
      {form.skills.filter(s => !PRESET_SKILLS.includes(s)).length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
          {form.skills.filter(s => !PRESET_SKILLS.includes(s)).map(s => (
            <span key={s} style={{ padding:'4px 10px', borderRadius:'100px', fontSize:'12px', background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.3)', color:'#a78bfa', display:'flex', alignItems:'center', gap:'4px' }}>
              {s}
              <button onClick={() => removeSkill(s)} aria-label="Remove skill" style={{ background:'none', border:'none', color:'#a78bfa', cursor:'pointer', lineHeight:1, padding:0, display:'inline-flex' }}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display:'flex', gap:'6px' }}>
        <input
          style={{ ...S.input, flex:1 }}
          value={skillInput}
          onChange={e => setSkillInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addSkill()}
          placeholder={t('form.skills_placeholder')}
        />
        <button onClick={() => addSkill()} aria-label="Add skill" style={{
          background:'rgba(232,255,71,0.1)', border:'1px solid rgba(232,255,71,0.25)',
          borderRadius:'8px', color:'#e8ff47', width:'38px', cursor:'pointer',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}><Plus size={17} /></button>
      </div>
    </>
  );
}

function TemplateProjectsEditor({ projects, openNewProject, openEditProject, deleteProject }) {
  const { t } = useTranslation();
  return (
    <>
      <div style={S.section}>{t('sections.projects')}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {projects.map(p => (
          <div key={p.id} style={{ ...S.card, display:'flex', alignItems:'center', gap:'10px', position:'relative', overflow:'hidden' }}>
            {p.bg_preview && (
              <div style={{ position:'absolute', inset:0, backgroundImage:`url(${p.bg_preview})`, backgroundSize:'cover', backgroundPosition:'center', opacity:0.15 }} />
            )}
            <div style={{ flex:1, position:'relative', zIndex:1, minWidth:0 }}>
              <div style={{ fontSize:'13px', fontWeight:600, color:'#f0ede8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
              <div style={{ fontSize:'11px', color:'#555', marginTop:'1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.description}</div>
              {p.link_url && <div style={{ fontSize:'10px', color:'#e8ff47', marginTop:'2px', fontFamily:'DM Mono, monospace', display:'flex', alignItems:'center', gap:4 }}><LinkIcon size={10} /> {p.link_url}</div>}
            </div>
            <div style={{ display:'flex', gap:'4px', zIndex:1 }}>
              <button onClick={() => openEditProject(p)} aria-label="Edit project" style={{ ...iconBtn }}><Settings2 size={13} /></button>
              <button onClick={() => deleteProject(p.id)} aria-label="Delete project" style={{ ...iconBtn, borderColor:'rgba(248,113,113,0.2)', color:'#f87171' }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        <button onClick={openNewProject} style={{
          background:'rgba(232,255,71,0.04)', border:'1.5px dashed rgba(232,255,71,0.2)',
          borderRadius:'10px', color:'#e8ff47', padding:'10px',
          cursor:'pointer', fontSize:'13px', fontFamily:'DM Sans, sans-serif',
          display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px',
        }}>
          <Plus size={15} /> {t('builder.add_case')}
        </button>
      </div>
    </>
  );
}

function SocialLinksEditor({ links, addSocialLink, updateSocialLink, removeSocialLink }) {
  const { t } = useTranslation();
  return (
    <>
      <div style={S.section}>{t('builder.socials')}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {links.map(link => (
          <div key={link.id} style={{ ...S.card, display:'grid', gridTemplateColumns:'116px 1fr 1fr 32px', gap:8, alignItems:'center' }}>
            <select
              style={{ ...S.input, padding:'8px' }}
              value={link.platform || 'Instagram'}
              onChange={e => updateSocialLink(link.id, { platform:e.target.value, label:e.target.value })}
            >
              {SOCIAL_PLATFORMS.map(platform => <option key={platform} value={platform}>{platform}</option>)}
            </select>
            <input
              style={S.input}
              value={link.label || link.platform || ''}
              onChange={e => updateSocialLink(link.id, { label:e.target.value })}
              placeholder={t('builder.social_label')}
            />
            <input
              style={S.input}
              value={link.url || ''}
              onChange={e => updateSocialLink(link.id, { url:e.target.value })}
              placeholder="https://..."
            />
            <button onClick={() => removeSocialLink(link.id)} style={{ ...iconBtn, color:'#f87171', borderColor:'rgba(248,113,113,0.2)' }} aria-label="Remove social"><Trash2 size={13} /></button>
          </div>
        ))}
        <button onClick={addSocialLink} style={{
          background:'rgba(232,255,71,0.04)', border:'1.5px dashed rgba(232,255,71,0.2)',
          borderRadius:'10px', color:'#e8ff47', padding:'9px', cursor:'pointer',
          display:'inline-flex', justifyContent:'center', alignItems:'center', gap:6,
        }}>
          <Plus size={14} /> {t('builder.add_social')}
        </button>
      </div>
    </>
  );
}

function TemplateBlockEditor({ blockKey, data, onChange }) {
  const { t } = useTranslation();
  const schema = BLOCK_FIELD_SCHEMAS[blockKey] || { label:'item', fields:[['name','Name'],['description','Description','textarea']] };
  const item = SECTION_CONFIG[blockKey] || { label:blockKey, icon:Layers };
  const Icon = item.icon;
  const items = data.items?.length ? data.items : [createDefaultItem(schema)];
  const sectionName = t(`sections.${blockKey}`, { defaultValue:item.label });
  const itemName = t(`block_items.${blockKey}`, { defaultValue:schema.label });

  const updateItem = (index, patch) => {
    const next = items.map((entry, i) => i === index ? { ...entry, ...patch } : entry);
    onChange({ items: next });
  };
  const uploadMedia = (index, key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => updateItem(index, {
      [key]: event.target.result,
      [`${key}_name`]: file.name,
      [`${key}_type`]: file.type,
    });
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ ...S.card, display:'flex', flexDirection:'column', gap:'10px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#f0ede8', fontWeight:700, fontSize:13 }}>
        <Icon size={15} />
        {sectionName}
      </div>
      <Field label={t('builder.block_title')}>
        <input style={S.input} value={data.title || sectionName} onChange={e => onChange({ title:e.target.value })} />
      </Field>
      <Field label={t('builder.block_description')}>
        <textarea style={{ ...S.input, minHeight:58, resize:'none' }} value={data.description || ''} onChange={e => onChange({ description:e.target.value })} placeholder={t(`block_hints.${blockKey}`, { defaultValue:getTemplateSectionHint(blockKey) })} />
      </Field>
      {items.map((entry, index) => (
        <div key={entry.id || index} style={{ border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:10, display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', color:'#777', fontSize:12 }}>
            {itemName} #{index + 1}
            <button onClick={() => onChange({ items: items.filter((_, i) => i !== index) })} disabled={items.length === 1} style={{ ...iconBtn, opacity:items.length === 1 ? 0.35 : 1 }}><Trash2 size={12} /></button>
          </div>
          {schema.fields.map(([key, label, type]) => (
            <Field key={key} label={t(`field_labels.${key}`, { defaultValue:label })}>
              {type === 'textarea' ? (
                <textarea style={{ ...S.input, minHeight:54, resize:'none' }} value={entry[key] || ''} onChange={e => updateItem(index, { [key]:e.target.value })} />
              ) : type === 'media' ? (
                <MediaUpload value={entry[key]} fileName={entry[`${key}_name`]} onChange={file => uploadMedia(index, key, file)} onClear={() => updateItem(index, { [key]:'', [`${key}_name`]:'', [`${key}_type`]:'' })} />
              ) : type === 'youtube' ? (
                <YoutubeField value={entry[key] || ''} onChange={value => updateItem(index, { [key]:value })} />
              ) : (
                <input type={type === 'date' ? 'date' : 'text'} style={S.input} value={entry[key] || ''} onChange={e => updateItem(index, { [key]:e.target.value })} />
              )}
            </Field>
          ))}
          {blockKey === 'map' && entry.address && <MapPreview address={entry.address} />}
        </div>
      ))}
      <button onClick={() => onChange({ items:[...items, createDefaultItem(schema)] })} style={{
        background:'rgba(232,255,71,0.04)', border:'1.5px dashed rgba(232,255,71,0.2)',
        borderRadius:'10px', color:'#e8ff47', padding:'9px', cursor:'pointer',
        display:'inline-flex', justifyContent:'center', alignItems:'center', gap:6,
      }}>
        <Plus size={14} /> {t('builder.add_item', { item:itemName.toLowerCase() })}
      </button>
    </div>
  );
}

function MediaUpload({ value, fileName, onChange, onClear, label }) {
  const { t } = useTranslation();
  const buttonLabel = label || t('builder.upload_media');
  return (
    <div style={{ display:'grid', gap:8 }}>
      {value ? (
        <div style={{ position:'relative', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, overflow:'hidden', background:'rgba(255,255,255,0.04)' }}>
          <img src={value} alt="" style={{ width:'100%', maxHeight:150, objectFit:'cover', display:'block' }} />
          <button onClick={onClear} style={{ position:'absolute', top:6, right:6, ...iconBtn, background:'rgba(10,10,15,0.82)', color:'#f87171' }} aria-label="Remove media"><X size={13} /></button>
          {fileName && <div style={{ padding:'6px 8px', fontSize:11, color:'#777', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fileName}</div>}
        </div>
      ) : (
        <label style={{
          border:'1.5px dashed rgba(232,255,71,0.22)', borderRadius:10, minHeight:82,
          display:'grid', placeItems:'center', color:'#e8ff47', cursor:'pointer',
          background:'rgba(232,255,71,0.035)', fontSize:12,
        }}>
          <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => onChange(e.target.files?.[0])} />
          <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><ImageIcon size={16} /> {buttonLabel}</span>
        </label>
      )}
    </div>
  );
}

function YoutubeField({ value, onChange }) {
  const embed = youtubeEmbedUrl(value);
  return (
    <div style={{ display:'grid', gap:8 }}>
      <input style={S.input} value={value} onChange={e => onChange(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
      {embed && (
        <iframe
          title="YouTube preview"
          src={embed}
          style={{ width:'100%', aspectRatio:'16/9', border:0, borderRadius:10, background:'#000' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

function MapPreview({ address }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  return (
    <div style={{ display:'grid', gap:6 }}>
      <iframe title="map preview" src={src} style={{ width:'100%', height:160, border:0, borderRadius:10, background:'#111' }} />
      <div style={{ fontSize:11, color:'#777', overflowWrap:'anywhere', userSelect:'text' }}>{address}</div>
    </div>
  );
}

function SmallBtn({ children, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      background: accent ? 'rgba(232,255,71,0.08)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${accent ? 'rgba(232,255,71,0.2)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius:'8px', color: accent ? '#e8ff47' : '#888',
      padding:'6px 14px', cursor:'pointer', fontSize:'12px',
      fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', gap:'5px',
      transition:'all 0.15s',
    }}>{children}</button>
  );
}

function ColorControl({ label, value, onChange }) {
  const normalized = /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#222222';
  return (
    <Field label={label}>
      <div style={{ display:'grid', gridTemplateColumns:'36px 1fr', gap:'6px' }}>
        <input
          type="color"
          value={normalized}
          onChange={e => onChange(e.target.value)}
          style={{
            width:36, height:36, padding:0, border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:8, background:'transparent', cursor:'pointer',
          }}
        />
        <input
          style={S.input}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="#e8ff47"
        />
      </div>
    </Field>
  );
}

function LocalDraftPreview({ form, projects, design, sectionOrder, contentBlocks, mobile }) {
  const { t } = useTranslation();
  const width = mobile ? 375 : '100%';
  const skills = form.skills || [];
  const centerSingle = shouldCenterSingleItem(form.layout);
  const customSocialLinks = Array.isArray(design.social_links)
    ? design.social_links.filter(link => (link?.url || '').trim())
    : [];

  const renderSection = (key) => {
    if (key === 'projects') {
      return (
        <section key={key} style={draftSectionStyle}>
          <h2 style={draftHeadingStyle}>{t('sections.projects')}</h2>
          {projects.length === 0 ? (
            <p style={draftTextStyle}>{t('builder.no_projects')}</p>
          ) : (
            <div style={{
              display:'grid',
              gridTemplateColumns:mobile ? '1fr' : (centerSingle && projects.length === 1 ? 'minmax(220px,520px)' : 'repeat(2,minmax(0,1fr))'),
              justifyContent:centerSingle && projects.length === 1 ? 'center' : 'stretch',
              gap:12,
            }}>
              {projects.map(project => (
                <article key={project.id} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:12, minWidth:0 }}>
                  <ProjectImage project={project} accent={design.accent} />
                  <h3 style={{ margin:'10px 0 6px', fontSize:16, overflowWrap:'anywhere' }}>{project.name || t('builder.project_name_placeholder')}</h3>
                  <p style={draftTextStyle}>{project.description || t('builder.project_desc_placeholder')}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      );
    }
    if (key === 'skills') {
      return (
        <section key={key} style={draftSectionStyle}>
          <h2 style={draftHeadingStyle}>{t('sections.skills')}</h2>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {(skills.length ? skills : [t('builder.skill_sample'), t('builder.experience_sample'), t('builder.service_sample')]).map(skill => (
              <span key={skill} style={{ padding:'7px 11px', borderRadius:999, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', fontSize:12, overflowWrap:'anywhere' }}>{skill}</span>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'contacts') {
      return (
        <section key={key} style={draftSectionStyle}>
          <h2 style={draftHeadingStyle}>{t('sections.contacts')}</h2>
          <div style={{ display:'grid', gridTemplateColumns:mobile ? '1fr' : 'repeat(2,minmax(0,1fr))', gap:8 }}>
            {[
              ['Email', form.email],
              [t('form.phone'), form.phone],
              [t('form.city'), form.city],
              [t('form.github'), form.github],
              ['Telegram', form.telegram],
              ['LinkedIn', form.linkedin],
            ].filter(([, value]) => value).map(([label, value]) => (
              <div key={label} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:10, minWidth:0 }}>
                <div style={{ fontSize:11, color:design.accent }}>{label}</div>
                <div style={{ fontSize:13, overflowWrap:'anywhere' }}>{value}</div>
              </div>
            ))}
          </div>
          {customSocialLinks.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:10 }}>
              {customSocialLinks.map((link, index) => (
                <a
                  key={link.id || `${link.platform}-${index}`}
                  href={normalizeLinkUrl(link.url, link.platform)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display:'inline-flex',
                    alignItems:'center',
                    gap:6,
                    border:`1px solid ${design.accent}55`,
                    color:design.accent,
                    borderRadius:999,
                    padding:'7px 11px',
                    fontSize:12,
                    textDecoration:'none',
                    overflowWrap:'anywhere',
                  }}
                >
                  <LinkIcon size={12} /> {link.label || link.platform || t('builder.social')}
                </a>
              ))}
            </div>
          )}
        </section>
      );
    }
    const item = SECTION_CONFIG[key] || { label:key };
    const block = contentBlocks.find(entry => entry.type === key);
    const previewItems = block?.items?.filter(hasContentItemValue) || [];
    return (
      <section key={key} style={draftSectionStyle}>
        <h2 style={draftHeadingStyle}>{block?.title || t(`sections.${key}`, { defaultValue:item.label })}</h2>
        <p style={draftTextStyle}>{block?.description || t(`block_hints.${key}`, { defaultValue:getTemplateSectionHint(key, design.template_kind) })}</p>
        {previewItems.length > 0 && (
          <div style={{
            display:'grid',
            gridTemplateColumns:mobile ? '1fr' : (centerSingle && previewItems.length === 1 ? 'minmax(220px,520px)' : '1fr'),
            justifyContent:centerSingle && previewItems.length === 1 ? 'center' : 'stretch',
            gap:8,
            marginTop:10,
          }}>
            {previewItems.map((entry, index) => {
              const titleInfo = getDraftItemTitle(entry, t, key, item.label, index);
              return (
                <div key={entry.id || index} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:10, display:'grid', gap:8 }}>
                  {firstMediaValue(entry) && (
                    <img src={firstMediaValue(entry)} alt="" style={{ width:'100%', maxHeight:180, objectFit:'cover', borderRadius:10, display:'block' }} />
                  )}
                  {entry.youtube_url && youtubeEmbedUrl(entry.youtube_url) && (
                    <iframe
                      title={`video-${entry.id || index}`}
                      src={youtubeEmbedUrl(entry.youtube_url)}
                      style={{ width:'100%', aspectRatio:'16/9', border:0, borderRadius:10, background:'#000' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  {key === 'map' && entry.address && <MapPreview address={entry.address} />}
                  <strong style={{ display:'block', fontSize:13, overflowWrap:'anywhere' }}>{titleInfo.title}</strong>
                  {renderDraftItemDetails(entry, titleInfo.key, t, design.accent)}
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  return (
    <div style={{ background:'#0a0a0f', padding:mobile ? '0 0 18px' : 0, display:'flex', justifyContent:'center' }}>
      <div style={{ width, maxWidth:'100%', minHeight:540, background:design.gradient, color:design.text, fontFamily:'DM Sans, sans-serif', overflow:'hidden' }}>
        <section style={{
          padding:mobile ? 22 : 34,
          borderBottom:'1px solid rgba(255,255,255,0.09)',
          display:form.layout === 'split-showcase' && !mobile ? 'grid' : 'block',
          gridTemplateColumns:'0.9fr 1.1fr',
          gap:20,
          alignItems:'center',
        }}>
          {form.layout === 'split-showcase' && (
            <div style={{
              minHeight:mobile ? 180 : 260,
              borderRadius:18,
              border:'1px solid rgba(255,255,255,0.1)',
              background:'rgba(255,255,255,0.06)',
              display:'grid',
              placeItems:'center',
              overflow:'hidden',
              marginBottom:mobile ? 18 : 0,
            }}>
              {design.split_logo ? (
                <img src={design.split_logo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              ) : (
                <span style={{ fontSize:mobile ? 72 : 112, color:design.accent, fontWeight:900, lineHeight:1 }}>
                  {(form.full_name || 'CF').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          )}
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, color:design.accent, fontSize:11, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
              <Eye size={14} /> {t('builder.draft_preview')}
            </div>
            <h1 style={{ margin:'0 0 8px', fontFamily:"'Bebas Neue', sans-serif", fontSize:mobile ? 40 : 58, letterSpacing:1, lineHeight:1, overflowWrap:'anywhere' }}>{form.full_name || t('builder.your_name')}</h1>
            <div style={{ color:design.accent, fontSize:16, overflowWrap:'anywhere' }}>{form.role || t('builder.your_role')}</div>
            {form.bio && <p style={{ ...draftTextStyle, marginTop:12, maxWidth:680 }}>{form.bio}</p>}
            {design.primary_link_url && (
              <a
                href={normalizeLinkUrl(design.primary_link_url)}
                target="_blank"
                rel="noreferrer"
                style={{
                  marginTop:16,
                  display:'inline-flex',
                  alignItems:'center',
                  gap:7,
                  background:design.accent,
                  color:'#0a0a0f',
                  borderRadius:999,
                  padding:'10px 15px',
                  textDecoration:'none',
                  fontSize:13,
                  fontWeight:800,
                }}
              >
              <LinkIcon size={14} /> {design.primary_link_label || t('builder.go')}
              </a>
            )}
          </div>
        </section>
        <div style={{ padding:mobile ? 14 : 20, display:'grid', gap:14 }}>
          {sectionOrder.map(renderSection)}
        </div>
      </div>
    </div>
  );
}

function ProjectImage({ project, accent }) {
  if (project.bg_preview || project.bg_image_url) {
    return <img src={project.bg_preview || project.bg_image_url} alt="" style={{ width:'100%', height:130, objectFit:'cover', borderRadius:12, display:'block' }} />;
  }
  return (
    <div style={{ height:130, borderRadius:12, background:`linear-gradient(135deg, ${accent}33, rgba(255,255,255,0.08))`, border:'1px dashed rgba(255,255,255,0.16)', display:'flex', alignItems:'center', justifyContent:'center', color:accent }}>
      <ImageIcon size={24} />
    </div>
  );
}

function getDraftItemTitle(entry, t, sectionKey, fallbackLabel, index) {
  for (const key of TITLE_FIELD_KEYS) {
    const value = String(entry?.[key] || '').trim();
    if (value) return { title:value, key };
  }
  return {
    title:`${t(`sections.${sectionKey}`, { defaultValue:fallbackLabel })} #${index + 1}`,
    key:'',
  };
}

function renderDraftItemDetails(entry, titleKey, t, accent) {
  const seen = new Set();
  const rows = [...DETAIL_FIELD_KEYS, ...Object.keys(entry || {}).sort()]
    .filter(key => {
      if (seen.has(key)) return false;
      seen.add(key);
      if (key === titleKey || MEDIA_FIELD_KEYS.includes(key) || MEDIA_META_FIELD_KEYS.includes(key)) return false;
      return String(entry?.[key] || '').trim();
    });

  if (!rows.length) return null;

  return (
    <div style={{ display:'grid', gap:6 }}>
      {rows.map(key => {
        const value = formatDraftFieldValue(key, entry[key], t);
        const linkValue = ['url', 'youtube_url'].includes(key) ? normalizeLinkUrl(entry[key]) : '';
        return (
          <div key={key} style={{ background:'rgba(255,255,255,0.045)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'7px 8px', minWidth:0 }}>
            <div style={{ fontSize:10, color:accent, textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>
              {t(`field_labels.${key}`, { defaultValue:key.replace(/_/g, ' ') })}
            </div>
            {linkValue ? (
              <a href={linkValue} target="_blank" rel="noreferrer" style={{ color:'#fff', fontSize:12, overflowWrap:'anywhere', textDecoration:'none' }}>
                {value}
              </a>
            ) : (
              <div style={{ ...draftTextStyle, fontSize:12 }}>{value}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDraftFieldValue(key, value, t) {
  const text = String(value || '').trim();
  if (key !== 'required') return text;
  const normalized = text.toLowerCase();
  if (['yes', 'true', '1', 'required', 'да', 'так'].includes(normalized)) {
    return t('builder.yes', { defaultValue:'yes' });
  }
  if (['no', 'false', '0', 'optional', 'нет', 'ні'].includes(normalized)) {
    return t('builder.no', { defaultValue:'no' });
  }
  return text;
}

function normalizeEnabledBlocks(enabled, templateBlocks) {
  const base = Array.isArray(enabled) ? enabled : [];
  const filtered = base.filter(key => templateBlocks.includes(key));
  const initial = filtered.length ? filtered : templateBlocks.slice(0, Math.min(templateBlocks.length, 5));
  return initial.includes('contacts') ? initial : [...initial, 'contacts'];
}

function normalizeInitialContentBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .filter(block => block?.type && SECTION_CONFIG[block.type])
    .map(block => ({
      ...createDefaultContentBlock(block.type),
      ...block,
      items: Array.isArray(block.items) ? block.items : [],
    }));
}

function normalizeContentBlocks(blocks, enabledBlocks) {
  const input = normalizeInitialContentBlocks(blocks);
  return enabledBlocks
    .filter(key => !['skills', 'projects', 'contacts'].includes(key))
    .map(key => input.find(block => block.type === key) || createDefaultContentBlock(key));
}

function createDefaultContentBlock(type) {
  const schema = BLOCK_FIELD_SCHEMAS[type] || { fields:[['name','Name'],['description','Description','textarea']] };
  return {
    id: `section-${type}`,
    type,
    title: '',
    description: '',
    items: [createDefaultItem(schema)],
  };
}

function createDemoContentBlock(type, t, language = 'uk') {
  const block = createDefaultContentBlock(type);
  const locale = getLanguageKey(language);
  const demoItems = (DEMO_BLOCK_ITEMS[locale] || DEMO_BLOCK_ITEMS.uk)[type];
  return {
    ...block,
    description: t ? t(`block_hints.${type}`, { defaultValue:getTemplateSectionHint(type) }) : getTemplateSectionHint(type),
    items: demoItems ? demoItems.map(item => ({ id:`item-${Date.now()}-${Math.random().toString(16).slice(2)}`, ...item })) : block.items,
  };
}

function createDefaultItem(schema) {
  const item = { id:`item-${Date.now()}-${Math.random().toString(16).slice(2)}` };
  (schema.fields || []).forEach(([key]) => {
    item[key] = '';
  });
  return item;
}

function normalizeSectionOrder(order, enabledBlocks = DEFAULT_SECTION_ORDER) {
  const input = Array.isArray(order) ? order : [];
  const known = input.filter(key => SECTION_CONFIG[key] && enabledBlocks.includes(key));
  const missing = enabledBlocks.filter(key => !known.includes(key));
  return [...known, ...missing];
}

function getTemplateSectionHint(key, templateKind) {
  const hints = {
    services: 'Services with description, price, photo, or icon.',
    packages: 'Basic, standard, and premium packages with what is included.',
    process: 'Work steps: request, call, work, delivery.',
    testimonials: 'Client testimonials with name, company, text, and rating.',
    faq: 'Frequent questions and answers that remove objections.',
    team: 'Team members, roles, photos, and short descriptions.',
    partners: 'Partner logos and links.',
    gallery: 'Photos and captions for visual presentation.',
    video: 'YouTube link with a mini preview directly in the builder.',
    stats: 'Key numbers: clients, experience, projects, results.',
    timer: 'Timer until an event, promotion, or launch.',
    map: 'Google Maps or OpenStreetMap map.',
    calculator: 'Cost calculation by service type, quantity, and options.',
    menu: 'Menu categories and items with photo, description, and price.',
    program: 'Modules, lessons, duration, and learning outcome.',
    specs: 'Product specifications: parameter and value.',
    comparison: 'Comparison of models, packages, or variants.',
    form: 'Request form with fields needed for this niche.',
  };
  return hints[key] || `This block will be adapted to the "${templateKind}" template.`;
}

function getLanguageKey(language) {
  const key = String(language || '').split('-')[0].toLowerCase();
  return ['uk', 'ru', 'en'].includes(key) ? key : 'uk';
}

function buildGradient(design) {
  const angle = Number.isFinite(Number(design.gradient_angle)) ? Number(design.gradient_angle) : 135;
  const from = normalizeHex(design.gradient_from, '#0a0a0f');
  const via = normalizeHex(design.gradient_via, '#1a0f2e');
  const to = normalizeHex(design.gradient_to, '#e8ff47');
  return `linear-gradient(${angle}deg, ${from}, ${via}, ${to})`;
}

function normalizeHex(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback;
}

function youtubeEmbedUrl(value) {
  const url = (value || '').trim();
  if (!url) return '';
  const direct = url.match(/youtu\.be\/([^?&]+)/i);
  const watch = url.match(/[?&]v=([^?&]+)/i);
  const shorts = url.match(/youtube\.com\/shorts\/([^?&/]+)/i);
  const id = direct?.[1] || watch?.[1] || shorts?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : '';
}

function firstMediaValue(entry) {
  return MEDIA_FIELD_KEYS
    .map(key => entry?.[key])
    .find(value => typeof value === 'string' && /^(data:image\/|https?:\/\/|blob:)/i.test(value.trim())) || '';
}

function hasContentItemValue(entry) {
  if (!entry || typeof entry !== 'object') return false;
  return Object.entries(entry).some(([key, value]) => {
    if (MEDIA_META_FIELD_KEYS.includes(key)) return false;
    return String(value || '').trim();
  });
}

function shouldCenterSingleItem(layout) {
  return ['centered', 'hero', 'cards', 'magazine', 'product'].includes(layout);
}

function normalizeLinkUrl(value, platform = '') {
  const trimmed = (value || '').trim();
  if (!trimmed) return '#';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;

  const handle = trimmed.replace(/^@/, '').replace(/^\/+/, '');
  const kind = (platform || '').toLowerCase();
  if (kind.includes('telegram')) return `https://t.me/${handle.replace(/^t\.me\//i, '')}`;
  if (kind.includes('instagram')) return `https://instagram.com/${handle.replace(/^instagram\.com\//i, '')}`;
  if (kind.includes('twitter') || kind === 'x') return `https://x.com/${handle.replace(/^(x|twitter)\.com\//i, '')}`;
  if (kind.includes('tiktok')) return `https://www.tiktok.com/@${handle.replace(/^@/, '').replace(/^tiktok\.com\/@?/i, '')}`;
  if (kind.includes('facebook')) return `https://facebook.com/${handle.replace(/^facebook\.com\//i, '')}`;
  if (kind.includes('youtube')) return handle.includes('.') || handle.includes('/') ? `https://${handle}` : `https://youtube.com/@${handle}`;
  if (kind.includes('github') && !handle.includes('.') && !handle.includes('/')) return `https://github.com/${handle}`;
  if (kind.includes('linkedin') && !handle.includes('linkedin.com')) return `https://www.linkedin.com/in/${handle.replace(/^in\//i, '')}`;
  if (kind.includes('behance')) return `https://behance.net/${handle.replace(/^behance\.net\//i, '')}`;
  if (kind.includes('dribbble')) return `https://dribbble.com/${handle.replace(/^dribbble\.com\//i, '')}`;
  if (kind.includes('whatsapp')) return `https://wa.me/${handle.replace(/\D/g, '')}`;
  return `https://${trimmed}`;
}

const draftSectionStyle = {
  background:'rgba(0,0,0,0.22)',
  border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:14,
  padding:16,
  minWidth:0,
};

const draftHeadingStyle = {
  margin:'0 0 10px',
  fontSize:18,
  overflowWrap:'anywhere',
};

const draftTextStyle = {
  margin:0,
  color:'rgba(255,255,255,0.72)',
  lineHeight:1.55,
  overflowWrap:'anywhere',
  wordBreak:'break-word',
};

const iconBtn = {
  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:'7px', padding:'4px 8px', cursor:'pointer', fontSize:'12px', transition:'all 0.15s',
  color:'#888', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'4px',
};
