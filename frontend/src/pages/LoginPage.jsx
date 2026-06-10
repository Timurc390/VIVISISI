import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import GoogleAuthButton, { DisabledGoogleAuthButton } from '../components/ui/GoogleAuthButton';
import { IS_GOOGLE_AUTH_ENABLED } from '../config/googleAuth';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, googleLogin, isLoading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success(t('toast.login_success'));
      navigate('/dashboard');
    } else {
      toast.error(t('auth.error_invalid'));
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    const result = await googleLogin(tokenResponse.access_token);
    if (result.success) {
      toast.success(t('toast.login_success'));
      navigate('/dashboard');
    } else {
      toast.error(t('toast.error'));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Lang switcher top right */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 50 }}>
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: '#111118',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '3px', color: '#e8ff47', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
          CARD<span style={{ color: '#f0ede8' }}>FORGE</span>
        </Link>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f0ede8', marginBottom: '0.3rem' }}>
          {t('auth.login_title')}
        </h1>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '1.8rem' }}>
          {t('auth.login_sub')}
        </p>

        {IS_GOOGLE_AUTH_ENABLED ? (
          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error(t('toast.error'))}
          >
            {t('auth.google_btn')}
          </GoogleAuthButton>
        ) : (
          <DisabledGoogleAuthButton message={t('auth.google_disabled')}>
            {t('auth.google_btn')}
          </DisabledGoogleAuthButton>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '12px', color: '#555' }}>{t('auth.or')}</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label={t('auth.email')} error={errors.email}>
            <input
              {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })}
              type="email"
              placeholder="you@example.com"
              style={inputStyle}
            />
          </Field>
          <Field label={t('auth.password')} error={errors.password}>
            <input
              {...register('password', { required: true, minLength: 6 })}
              type="password"
              placeholder="••••••••"
              style={inputStyle}
            />
          </Field>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: '#e8ff47',
              color: '#0a0a0f',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1rem',
              letterSpacing: '2px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              marginTop: '4px',
            }}
          >
            {isLoading ? '...' : t('auth.login_btn')}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '13px', color: '#555', textAlign: 'center' }}>
          {t('auth.no_account')}{' '}
          <Link to="/register" style={{ color: '#e8ff47', textDecoration: 'none' }}>
            {t('nav.register')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '12px', color: '#888' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: '11px', color: '#f87171' }}>Обов'язкове поле</span>}
    </div>
  );
}

const inputStyle = {
  background: '#1a1a24',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#f0ede8',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '14px',
  padding: '10px 12px',
  outline: 'none',
  width: '100%',
};
