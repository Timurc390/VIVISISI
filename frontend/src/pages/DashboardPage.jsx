import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { cardsApi } from '../api';

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, isLoading } = useQuery('cards', () => cardsApi.list().then(r => r.data));

  const deleteMutation = useMutation(id => cardsApi.delete(id), {
    onSuccess: () => {
      qc.invalidateQueries('cards');
      toast.success(t('toast.deleted'));
      setConfirmDelete(null);
    },
    onError: () => toast.error(t('toast.error')),
  });

  const copyLink = (slug) => {
    const url = `${window.location.origin}/c/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success(t('toast.copied'));
  };

  const downloadHTML = (card) => {
    if (!card.generated_html) return toast.error('Спочатку згенеруй сайт');
    const blob = new Blob([card.generated_html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${card.full_name.replace(/\s+/g, '-').toLowerCase()}-vizitka.html`;
    a.click();
  };

  const cards = data?.results || data || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '3px', color: '#f0ede8' }}>
            {t('dashboard.title')}
          </h1>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>
            {cards.length} {cards.length === 1 ? 'візитка' : 'візиток'}
          </p>
        </div>
        <Link to="/cards/new" style={{
          background: '#e8ff47', color: '#0a0a0f', textDecoration: 'none',
          borderRadius: '10px', padding: '10px 22px',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '2px',
        }}>
          + {t('nav.create')}
        </Link>
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', height: '200px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '5rem 2rem' }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.2 }}>⬡</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '2px', color: 'rgba(240,237,232,0.2)', marginBottom: '0.5rem' }}>
            {t('dashboard.empty_title')}
          </div>
          <p style={{ color: '#555', fontSize: '13px', marginBottom: '1.5rem' }}>{t('dashboard.empty_desc')}</p>
          <Link to="/cards/new" style={{
            background: '#e8ff47', color: '#0a0a0f', textDecoration: 'none',
            borderRadius: '10px', padding: '12px 28px',
            fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px',
          }}>
            {t('dashboard.create_first')}
          </Link>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
          <AnimatePresence>
            {cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                {/* Thumbnail strip */}
                <div style={{
                  height: '8px',
                  background: themeGradient(card.theme),
                }} />

                <div style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: '#f0ede8', marginBottom: '2px' }}>
                        {card.full_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{card.role}</div>
                    </div>
                    <div style={{
                      fontSize: '10px',
                      padding: '3px 9px',
                      borderRadius: '100px',
                      background: card.generated_html ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                      color: card.generated_html ? '#4ade80' : '#555',
                      border: `1px solid ${card.generated_html ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {card.generated_html ? t('dashboard.generated') : t('dashboard.not_generated')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {(card.skills || []).slice(0, 4).map(s => (
                      <span key={s} style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', color: '#888' }}>{s}</span>
                    ))}
                    {card.skills?.length > 4 && <span style={{ fontSize: '11px', color: '#555' }}>+{card.skills.length - 4}</span>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '11px', color: '#444', fontFamily: 'DM Mono, monospace' }}>
                      👁 {card.views_count} {t('dashboard.card_views')}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <ActionBtn
                        onClick={() => window.open(`/c/${card.slug}`, '_blank', 'noopener,noreferrer')}
                        title="Переглянути візитку"
                      >
                        👁
                      </ActionBtn>
                      <ActionBtn onClick={() => navigate(`/cards/${card.id}/edit`)} title={t('dashboard.edit')}>✏️</ActionBtn>
                      <ActionBtn onClick={() => copyLink(card.slug)} title={t('dashboard.copy_link')}>🔗</ActionBtn>
                      {card.generated_html && <ActionBtn onClick={() => downloadHTML(card)} title={t('dashboard.download')}>💾</ActionBtn>}
                      <ActionBtn onClick={() => setConfirmDelete(card.id)} title={t('dashboard.delete')} danger>🗑</ActionBtn>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#111118', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '16px', padding: '2rem', maxWidth: '360px', width: '100%',
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>⚠️</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{t('dashboard.confirm_delete')}</div>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '1.5rem' }}>Цю дію не можна скасувати.</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => setConfirmDelete(null)} style={cancelBtnStyle}>Скасувати</button>
                <button onClick={() => deleteMutation.mutate(confirmDelete)} style={deleteBtnStyle}>
                  {deleteMutation.isLoading ? '...' : t('dashboard.delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionBtn({ children, onClick, title, danger }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: danger ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${danger ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px',
      transition: 'all 0.15s',
    }}>
      {children}
    </button>
  );
}

function themeGradient(theme) {
  const map = {
    'dark-neon': 'linear-gradient(90deg, #0a0a0f, #e8ff47)',
    'clean-light': 'linear-gradient(90deg, #f8fafc, #2563eb)',
    'warm-cream': 'linear-gradient(90deg, #fdf6e3, #d97706)',
    'ocean-blue': 'linear-gradient(90deg, #0c1445, #38bdf8)',
    'forest-green': 'linear-gradient(90deg, #0d1f0d, #4ade80)',
    'sunset-red': 'linear-gradient(90deg, #2d0a0a, #f97316)',
    'minimal-gray': 'linear-gradient(90deg, #141414, #888)',
    'purple-haze': 'linear-gradient(90deg, #1a0d2e, #a78bfa)',
  };
  return map[theme] || map['dark-neon'];
}

const cancelBtnStyle = {
  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#888', padding: '8px 18px', cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
};
const deleteBtnStyle = {
  background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)',
  borderRadius: '8px', color: '#f87171', padding: '8px 18px', cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600,
};
