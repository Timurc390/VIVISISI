import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import LanguageSwitcher from '../ui/LanguageSwitcher';

export default function AppLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success(t('toast.logout_success'));
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/cards/new', label: t('nav.create') },
    { to: '/profile', label: t('nav.profile') },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0ede8' }}>
      <nav style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <Link to="/dashboard" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '3px', color: '#e8ff47', textDecoration: 'none' }}>
          CARD<span style={{ color: '#f0ede8' }}>FORGE</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              color: location.pathname === link.to ? '#e8ff47' : 'rgba(240,237,232,0.6)',
              background: location.pathname === link.to ? 'rgba(232,255,71,0.08)' : 'transparent',
              transition: 'all 0.2s',
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LanguageSwitcher />
          <div style={{ fontSize: '13px', color: 'rgba(240,237,232,0.5)' }}>
            {user?.first_name || user?.email}
          </div>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'rgba(240,237,232,0.6)',
            padding: '6px 14px',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.2s',
          }}>
            {t('nav.logout')}
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{ padding: '2rem' }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
