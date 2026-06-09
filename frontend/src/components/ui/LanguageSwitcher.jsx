import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';

const LANGS = [
  { code: 'uk', flag: '🇺🇦', label: 'UA' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { isAuthenticated, setLanguage } = useAuthStore();
  const [open, setOpen] = useState(false);

  const current = LANGS.find(l => l.code === i18n.language) || LANGS[0];

  const handleChange = async (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('cardforge_lang', code);
    if (isAuthenticated) await setLanguage(code);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: '#f0ede8',
          padding: '5px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          fontFamily: 'DM Mono, monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s',
        }}
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <span style={{ opacity: 0.5, fontSize: '10px' }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          background: '#111118',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px',
          padding: '6px',
          zIndex: 200,
          minWidth: '120px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {LANGS.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                background: i18n.language === lang.code ? 'rgba(232,255,71,0.08)' : 'transparent',
                border: 'none',
                borderRadius: '7px',
                color: i18n.language === lang.code ? '#e8ff47' : '#f0ede8',
                padding: '7px 10px',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                textAlign: 'left',
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.label === 'UA' ? 'Українська' : lang.label === 'EN' ? 'English' : 'Русский'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
