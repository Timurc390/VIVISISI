import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { cardsApi, generatorApi } from '../api';
import CardForm from '../components/ui/CardForm';

export default function CreateCardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');
  const [cardId, setCardId] = useState(null);

  // Save card + projects, returns saved card
  const saveCard = async (form, projects) => {
    setIsSaving(true);
    try {
      let card;
      if (cardId) {
        const { data } = await cardsApi.update(cardId, {
          full_name: form.full_name, role: form.role, bio: form.bio,
          email: form.email, phone: form.phone, city: form.city,
          github: form.github, telegram: form.telegram, linkedin: form.linkedin,
          skills: form.skills, theme: form.theme, layout: form.layout, sphere: form.sphere,
        });
        card = data;
      } else {
        const { data } = await cardsApi.create({
          full_name: form.full_name || 'Без назви', role: form.role || 'Спеціаліст',
          bio: form.bio, email: form.email, phone: form.phone, city: form.city,
          github: form.github, telegram: form.telegram, linkedin: form.linkedin,
          skills: form.skills, theme: form.theme, layout: form.layout, sphere: form.sphere,
        });
        card = data;
        setCardId(card.id);
      }

      // Sync projects
      for (const p of projects) {
        if (!p._saved) {
          const fd = new FormData();
          fd.append('name', p.name);
          fd.append('description', p.description || '');
          fd.append('link_label', p.link_label || 'Переглянути');
          fd.append('link_url', p.link_url || '');
          if (p.bg_image instanceof File) fd.append('bg_image', p.bg_image);
          await cardsApi.addProject(card.id, fd);
        }
      }

      toast.success(t('toast.saved'));
      return card;
    } catch (err) {
      toast.error(t('toast.error'));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (form, projects) => {
    const card = await saveCard(form, projects);
    if (card) navigate(`/cards/${card.id}/edit`);
  };

  const handleGenerate = async (form, projects) => {
    setIsGenerating(true);
    try {
      const card = await saveCard(form, projects);
      if (!card) return;

      const { data } = await generatorApi.generate(card.id);
      setPreviewHTML(data.generated_html || '');
      toast.success(t('toast.generated'));
    } catch {
      toast.error(t('toast.error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.5rem)', letterSpacing: '3px', color: '#f0ede8' }}>
          НОВА ВІЗИТКА
        </h1>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>
          Заповни форму та натисни «Згенерувати» — AI створить унікальний сайт
        </p>
      </div>

      <CardForm
        onSave={handleSave}
        onGenerate={handleGenerate}
        isSaving={isSaving}
        isGenerating={isGenerating}
        previewHTML={previewHTML}
      />
    </div>
  );
}
