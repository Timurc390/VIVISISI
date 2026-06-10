import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

export default function GoogleAuthButton({ children, onSuccess, onError }) {
  const handleGoogle = useGoogleLogin({
    onSuccess,
    onError,
  });

  return (
    <button type="button" onClick={() => handleGoogle()} style={buttonStyle}>
      <GoogleIcon />
      {children}
    </button>
  );
}

export function DisabledGoogleAuthButton({ children, message }) {
  return (
    <button type="button" disabled title={message} style={disabledButtonStyle}>
      <GoogleIcon />
      {children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002s.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

const buttonStyle = {
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
};

const disabledButtonStyle = {
  ...buttonStyle,
  cursor: 'not-allowed',
  opacity: 0.55,
};
