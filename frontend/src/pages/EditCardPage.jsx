import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { cardsApi, generatorApi, getApiErrorMessage } from '../api';
import CardForm from '../components/ui/CardForm';

export default function EditCardPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');

  const { data: card, isLoading, isError } = useQuery(
    ['card', id],
    () => cardsApi.get(id).then(r => r.data),
    {
      onSuccess: (data) => {
        if (!previewHTML && data.generated_html) setPreviewHTML(data.generated_html);
      },
    }
  );

  const saveCard = async (form, projects) => {
    setIsSaving(true);
    try {
      const { data: updated } = await cardsApi.update(id, {
        full_name: form.full_name, role: form.role, bio: form.bio,
        email: form.email, phone: form.phone, city: form.city,
        github: form.github, telegram: form.telegram, linkedin: form.linkedin,
        skills: form.skills, theme: form.theme, layout: form.layout, sphere: form.sphere,
      });

      // Add new projects (those without a real server id)
      const existingIds = new Set((card?.projects || []).map(p => p.id));
      for (const p of projects) {
        if (!existingIds.has(p.id) || p._new) {
          const fd = new FormData();
          fd.append('name', p.name);
          fd.append('description', p.description || '');
          fd.append('link_label', p.link_label || 'Переглянути');
          fd.append('link_url', normalizeUrl(p.link_url));
          if (p.bg_image instanceof File) fd.append('bg_image', p.bg_image);
          await cardsApi.addProject(id, fd);
        }
      }

      // Remove deleted projects
      const newIds = new Set(projects.map(p => p.id));
      for (const p of (card?.projects || [])) {
        if (!newIds.has(p.id)) await cardsApi.deleteProject(id, p.id);
      }

      qc.invalidateQueries(['card', id]);
      toast.success(t('toast.saved'));
      return updated;
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('toast.error')));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (form, projects) => {
    await saveCard(form, projects);
  };

  const handleGenerate = async (form, projects) => {
    setIsGenerating(true);
    try {
      await saveCard(form, projects);
      const { data } = await generatorApi.generate(id);
      setPreviewHTML(data.generated_html || '');
      toast.success(t('toast.generated'));
    } catch {
      toast.error(t('toast.error'));
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#555' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid rgba(232,255,71,0.3)', borderTopColor: '#e8ff47', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', letterSpacing: '1px' }}>ЗАВАНТАЖЕННЯ...</div>
      </div>
    </div>
  );

  if (isError) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#f87171' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
      Візитку не знайдено. <button onClick={() => navigate('/dashboard')} style={{ color: '#e8ff47', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>До дашборду</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.5rem)', letterSpacing: '3px', color: '#f0ede8' }}>
            РЕДАГУВАННЯ
          </h1>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>
            {card?.full_name} · {card?.role}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a
            href={`/c/${card?.slug}`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#888', padding: '8px 16px',
              fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            🔗 Публічна сторінка
          </a>
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', color: '#666', padding: '8px 16px',
            cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
          }}>
            ← Назад
          </button>
        </div>
      </div>

      <CardForm
        initialData={card}
        onSave={handleSave}
        onGenerate={handleGenerate}
        isSaving={isSaving}
        isGenerating={isGenerating}
        previewHTML={previewHTML}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function normalizeUrl(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
