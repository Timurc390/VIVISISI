import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import uk from './uk.json';
import ru from './ru.json';
import en from './en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uk: { translation: uk },
      ru: { translation: ru },
      en: { translation: en },
    },
    fallbackLng: 'uk',
    supportedLngs: ['uk', 'ru', 'en'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'cardforge_lang',
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
