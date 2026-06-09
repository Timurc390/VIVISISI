import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { authApi } from '../api';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, setLanguage } = useAuthStore();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '' });
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('first_name', form.first_name);
      fd.append('last_name', form.last_name);
      if (avatarFile) fd.append('avatar', avatarFile);
      const { data } = await authApi.updateMe(fd);
      updateUser(data);
      toast.success(t('toast.saved'));
    } catch {
      toast.error(t('toast.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLang = async (lang) => {
    await setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('cardforge_lang', lang);
  };

  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.5rem)', letterSpacing: '3px', color: '#f0ede8', marginBottom: '2rem' }}>
        {t('nav.profile')}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

        {/* Avatar & name card */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} style={cardStyle}>
          <div style={{ fontFamily:'DM Mono, monospace', fontSize:'10px', letterSpacing:'2px', color:'#555', textTransform:'uppercase', marginBottom:'1.2rem' }}>
            Особисті дані
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'1.2rem', marginBottom:'1.5rem' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:72, height:72, borderRadius:'50%', overflow:'hidden', background:'#1a1a24', border:'2px solid rgba(232,255,71,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.6rem', color:'#e8ff47' }}>{initials}</span>
                }
              </div>
              <label htmlFor="avatar-inp" style={{ position:'absolute', bottom:0, right:0, background:'#e8ff47', width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'12px' }}>
                ✏️
              </label>
              <input id="avatar-inp" type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarChange} />
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:'15px', color:'#f0ede8' }}>{user?.full_name || user?.email}</div>
              <div style={{ fontSize:'13px', color:'#555', marginTop:'2px' }}>{user?.email}</div>
              <div style={{ fontSize:'11px', color:'#444', marginTop:'4px', fontFamily:'DM Mono, monospace' }}>
                Зареєстровано: {user?.created_at ? new Date(user.created_at).toLocaleDateString('uk-UA') : '—'}
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'1.2rem' }}>
            {[['first_name', "Ім'я", 'Іван'], ['last_name', 'Прізвище', 'Коваленко']].map(([k,l,ph]) => (
              <div key={k}>
                <label style={labelStyle}>{l}</label>
                <input style={inputStyle} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} />
              </div>
            ))}
          </div>

          <button onClick={handleSave} disabled={isSaving} style={{
            background:'#e8ff47', border:'none', borderRadius:'10px', color:'#0a0a0f',
            padding:'10px 24px', cursor: isSaving ? 'not-allowed' : 'pointer',
            fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.95rem', letterSpacing:'2px',
            opacity: isSaving ? 0.6 : 1,
          }}>
            {isSaving ? t('form.saving') : t('form.save_btn')}
          </button>
        </motion.div>

        {/* Language card */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }} style={cardStyle}>
          <div style={{ fontFamily:'DM Mono, monospace', fontSize:'10px', letterSpacing:'2px', color:'#555', textTransform:'uppercase', marginBottom:'1.2rem' }}>
            Мова інтерфейсу
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            {[['uk','🇺🇦','Українська'],['en','🇬🇧','English'],['ru','🇷🇺','Русский']].map(([code, flag, label]) => (
              <button key={code} onClick={() => handleLang(code)} style={{
                flex:1, padding:'10px 8px', borderRadius:'10px', cursor:'pointer',
                background: i18n.language === code ? 'rgba(232,255,71,0.1)' : 'rgba(255,255,255,0.03)',
                border:`1px solid ${i18n.language === code ? 'rgba(232,255,71,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: i18n.language === code ? '#e8ff47' : '#888',
                fontFamily:'DM Sans, sans-serif', fontSize:'13px', transition:'all 0.15s',
                display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
              }}>
                <span style={{ fontSize:'1.4rem' }}>{flag}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats card */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }} style={cardStyle}>
          <div style={{ fontFamily:'DM Mono, monospace', fontSize:'10px', letterSpacing:'2px', color:'#555', textTransform:'uppercase', marginBottom:'1.2rem' }}>
            Обліковий запис
          </div>
          <div style={{ display:'flex', gap:'1rem' }}>
            {[
              { icon:'📧', label:'Email', value: user?.email },
              { icon:'🌐', label:'Авторизація', value: 'Email / Google' },
            ].map(item => (
              <div key={item.label} style={{ flex:1, background:'rgba(255,255,255,0.03)', borderRadius:'10px', padding:'0.8rem 1rem' }}>
                <div style={{ fontSize:'1.2rem', marginBottom:'4px' }}>{item.icon}</div>
                <div style={{ fontSize:'11px', color:'#555', marginBottom:'2px' }}>{item.label}</div>
                <div style={{ fontSize:'13px', color:'#f0ede8', wordBreak:'break-all' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const cardStyle = {
  background:'#111118', border:'1px solid rgba(255,255,255,0.07)',
  borderRadius:'16px', padding:'1.5rem',
};
const labelStyle = { fontSize:'12px', color:'#888', display:'block', marginBottom:'5px' };
const inputStyle = {
  background:'#1a1a24', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px',
  color:'#f0ede8', fontFamily:'DM Sans, sans-serif', fontSize:'14px',
  padding:'10px 12px', outline:'none', width:'100%',
};
