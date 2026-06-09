import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

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

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const result = await googleLogin(tokenResponse.access_token);
      if (result.success) {
        toast.success(t('toast.login_success'));
        navigate('/dashboard');
      } else {
        toast.error(t('toast.error'));
      }
    },
    onError: () => toast.error(t('toast.error')),
  });

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

        {/* Google */}
        <button
          onClick={() => handleGoogle()}
          style={{
            width: '100%',
            background: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '1.2rem',
            color: '#1a1a1a',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002s.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          {t('auth.google_btn')}
        </button>

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
