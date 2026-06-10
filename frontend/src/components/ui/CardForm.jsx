import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const THEMES = ['dark-neon','clean-light','warm-cream','ocean-blue','forest-green','sunset-red','minimal-gray','purple-haze'];
const LAYOUTS = ['centered','sidebar','hero','cards','terminal','magazine'];
const SPHERES = ['developer','designer','marketer','manager','freelancer','entrepreneur'];

const THEME_GRADIENTS = {
  'dark-neon': 'linear-gradient(135deg,#0f0f1a,#1a0f2e)',
  'clean-light': 'linear-gradient(135deg,#f8fafc,#e2e8f0)',
  'warm-cream': 'linear-gradient(135deg,#fdf6e3,#f5deb3)',
  'ocean-blue': 'linear-gradient(135deg,#0c1445,#1a3a5c)',
  'forest-green': 'linear-gradient(135deg,#0d1f0d,#1a3a1a)',
  'sunset-red': 'linear-gradient(135deg,#2d0a0a,#4a1515)',
  'minimal-gray': 'linear-gradient(135deg,#1a1a1a,#2d2d2d)',
  'purple-haze': 'linear-gradient(135deg,#1a0d2e,#2d1a4a)',
};

const LAYOUT_ICONS = {
  centered:'⬛', sidebar:'▐', hero:'▬', cards:'⊞', terminal:'▷', magazine:'≡',
};

const PRESET_SKILLS = ['React','Node.js','TypeScript','Python','Django','Docker','PostgreSQL','Figma','AWS','Vue.js','GraphQL','Redis','Kubernetes','Flutter','Swift'];

// ── reusable styled pieces ────────────────────────────────────────────────────
const S = {
  input: {
    background:'#1a1a24', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px',
    color:'#f0ede8', fontFamily:'DM Sans, sans-serif', fontSize:'14px',
    padding:'10px 12px', outline:'none', width:'100%', transition:'border-color 0.2s',
  },
  label: { fontSize:'12px', color:'#888', display:'block', marginBottom:'5px' },
  section: {
    fontFamily:'DM Mono, monospace', fontSize:'10px', letterSpacing:'2px',
    color:'#555', textTransform:'uppercase', paddingBottom:'8px',
    borderBottom:'1px solid rgba(255,255,255,0.06)', marginTop:'8px',
  },
  card: {
    background:'#1a1a24', border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:'12px', padding:'1rem',
  },
};

export default function CardForm({ initialData = {}, onSave, onGenerate, isSaving, isGenerating, previewHTML }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    full_name: '', role: '', bio: '', email: '', phone: '',
    city: '', github: '', telegram: '', linkedin: '',
    skills: [], theme: 'dark-neon', layout: 'centered', sphere: 'developer',
    ...initialData,
  });
  const [projects, setProjects] = useState(initialData.projects || []);
  const [skillInput, setSkillInput] = useState('');
  const [previewTab, setPreviewTab] = useState('preview');
  const [projectModal, setProjectModal] = useState(null); // null | 'new' | {project obj}
  const [modalData, setModalData] = useState({ name:'', description:'', link_label:'Переглянути', link_url:'', bg_image: null, bg_preview: null });
  const fileRefs = useRef({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const sphereValue = SPHERES.includes(form.sphere) ? form.sphere : 'other';
  const isCustomSphere = sphereValue === 'other';

  const handleSphereChange = (value) => {
    if (value === 'other') {
      set('sphere', form.sphere && !SPHERES.includes(form.sphere) ? form.sphere : '');
      return;
    }
    set('sphere', value);
  };

  // Skills
  const addSkill = (s) => {
    const v = (s || skillInput).trim();
    if (!v || form.skills.includes(v)) return;
    set('skills', [...form.skills, v]);
    setSkillInput('');
  };
  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s));
  const togglePreset = (s) => form.skills.includes(s) ? removeSkill(s) : addSkill(s);

  // Project modal
  const openNewProject = () => {
    setModalData({ name:'', description:'', link_label:'Переглянути', link_url:'', bg_image: null, bg_preview: null });
    setProjectModal('new');
  };
  const openEditProject = (p) => {
    setModalData({ ...p, bg_image: null, bg_preview: p.bg_image_url || null });
    setProjectModal(p);
  };
  const handleModalImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setModalData(d => ({ ...d, bg_image: file, bg_preview: ev.target.result }));
    reader.readAsDataURL(file);
  };
  const saveProject = () => {
    if (!modalData.name.trim()) return;
    if (projectModal === 'new') {
      setProjects(p => [...p, { ...modalData, id: Date.now() }]);
    } else {
      setProjects(p => p.map(x => x.id === projectModal.id ? { ...x, ...modalData } : x));
    }
    setProjectModal(null);
  };
  const deleteProject = (id) => setProjects(p => p.filter(x => x.id !== id));

  const handleSubmit = () => onSave && onSave(form, projects);
  const handleGenerate = () => onGenerate && onGenerate(form, projects);

  // Download HTML
  const downloadHTML = () => {
    if (!previewHTML) return;
    const blob = new Blob([previewHTML], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(form.full_name || 'vizitka').replace(/\s+/g,'-').toLowerCase()}.html`;
    a.click();
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'400px 1fr', gap:'1.5rem', alignItems:'start' }}>

      {/* ── LEFT: FORM ──────────────────────────────────────────────── */}
      <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'18px', overflow:'hidden', position:'sticky', top:'80px' }}>

        {/* Header */}
        <div style={{ padding:'1.2rem 1.4rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:30, height:30, background:'#e8ff47', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>📋</div>
          <div>
            <div style={{ fontSize:'13px', fontWeight:600 }}>{t('form.section_personal')}</div>
            <div style={{ fontSize:'11px', color:'#555' }}>Заповни поля — AI зробить решту</div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ padding:'1.2rem', display:'flex', flexDirection:'column', gap:'1rem', maxHeight:'calc(100vh - 260px)', overflowY:'auto' }}>

          {/* Personal */}
          <div style={S.section}>{t('form.section_personal')}</div>
          <Field label={t('form.name')}>
            <input style={S.input} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Іван Коваленко" />
          </Field>
          <Field label={t('form.role')}>
            <input style={S.input} value={form.role} onChange={e => set('role', e.target.value)} placeholder="Full-Stack Developer" />
          </Field>
          <Field label={t('form.bio')}>
            <textarea
              style={{ ...S.input, minHeight:80, maxHeight:200, overflowY:'auto', resize:'none', lineHeight:1.6 }}
              value={form.bio} onChange={e => set('bio', e.target.value)}
              placeholder={t('form.bio_placeholder')}
            />
          </Field>

          {/* Contacts */}
          <div style={S.section}>{t('form.section_contacts')}</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {[['email',t('form.email'),'ivan@example.com'],['phone',t('form.phone'),'+380 99 123-45-67']].map(([k,l,ph]) => (
              <Field key={k} label={l}>
                <input
                  type={k === 'email' ? 'email' : 'text'}
                  style={S.input}
                  value={form[k]}
                  onChange={e => set(k,e.target.value)}
                  placeholder={ph}
                />
              </Field>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {[['city',t('form.city'),'Київ'],['github',t('form.github'),'github.com/user']].map(([k,l,ph]) => (
              <Field key={k} label={l}><input style={S.input} value={form[k]} onChange={e => set(k,e.target.value)} placeholder={ph} /></Field>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {[['telegram',t('form.telegram'),'@username'],['linkedin',t('form.linkedin'),'linkedin.com/in/user']].map(([k,l,ph]) => (
              <Field key={k} label={l}><input style={S.input} value={form[k]} onChange={e => set(k,e.target.value)} placeholder={ph} /></Field>
            ))}
          </div>

          {/* Skills */}
          <div style={S.section}>{t('form.section_skills')}</div>
          {/* Preset tags */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {PRESET_SKILLS.map(s => (
              <button key={s} onClick={() => togglePreset(s)} style={{
                padding:'4px 12px', borderRadius:'100px', fontSize:'12px', cursor:'pointer',
                background: form.skills.includes(s) ? 'rgba(232,255,71,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${form.skills.includes(s) ? 'rgba(232,255,71,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: form.skills.includes(s) ? '#e8ff47' : '#888',
                transition:'all 0.15s',
              }}>{s}</button>
            ))}
          </div>
          {/* Selected custom */}
          {form.skills.filter(s => !PRESET_SKILLS.includes(s)).length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
              {form.skills.filter(s => !PRESET_SKILLS.includes(s)).map(s => (
                <span key={s} style={{ padding:'4px 10px', borderRadius:'100px', fontSize:'12px', background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.3)', color:'#a78bfa', display:'flex', alignItems:'center', gap:'4px' }}>
                  {s}
                  <button onClick={() => removeSkill(s)} style={{ background:'none', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:'14px', lineHeight:1, padding:0 }}>×</button>
                </span>
              ))}
            </div>
          )}
          {/* Custom skill input */}
          <div style={{ display:'flex', gap:'6px' }}>
            <input
              style={{ ...S.input, flex:1 }}
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSkill()}
              placeholder={t('form.skills_placeholder')}
            />
            <button onClick={() => addSkill()} style={{
              background:'rgba(232,255,71,0.1)', border:'1px solid rgba(232,255,71,0.25)',
              borderRadius:'8px', color:'#e8ff47', fontSize:'18px', width:'38px',
              cursor:'pointer', flexShrink:0, transition:'all 0.15s',
            }}>+</button>
          </div>

          {/* Projects */}
          <div style={S.section}>{t('form.section_projects')}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {projects.map(p => (
              <div key={p.id} style={{ ...S.card, display:'flex', alignItems:'center', gap:'10px', position:'relative', overflow:'hidden' }}>
                {p.bg_preview && (
                  <div style={{ position:'absolute', inset:0, backgroundImage:`url(${p.bg_preview})`, backgroundSize:'cover', backgroundPosition:'center', opacity:0.15 }} />
                )}
                <div style={{ flex:1, position:'relative', zIndex:1, minWidth:0 }}>
                  <div style={{ fontSize:'13px', fontWeight:600, color:'#f0ede8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize:'11px', color:'#555', marginTop:'1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.description}</div>
                  {p.link_url && <div style={{ fontSize:'10px', color:'#e8ff47', marginTop:'2px', fontFamily:'DM Mono, monospace' }}>🔗 {p.link_url}</div>}
                </div>
                <div style={{ display:'flex', gap:'4px', zIndex:1 }}>
                  <button onClick={() => openEditProject(p)} style={{ ...iconBtn }}>✏️</button>
                  <button onClick={() => deleteProject(p.id)} style={{ ...iconBtn, borderColor:'rgba(248,113,113,0.2)' }}>🗑</button>
                </div>
              </div>
            ))}
            <button onClick={openNewProject} style={{
              background:'rgba(232,255,71,0.04)', border:'1.5px dashed rgba(232,255,71,0.2)',
              borderRadius:'10px', color:'#e8ff47', padding:'10px',
              cursor:'pointer', fontSize:'13px', fontFamily:'DM Sans, sans-serif',
              transition:'all 0.15s',
            }}>
              + Додати проєкт
            </button>
          </div>

          {/* Design */}
          <div style={S.section}>{t('form.section_design')}</div>
          <Field label={t('form.theme')}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px' }}>
              {THEMES.map(th => (
                <button key={th} onClick={() => set('theme', th)} title={t(`themes.${th}`)} style={{
                  aspectRatio:'1', borderRadius:'8px', cursor:'pointer', border:`2px solid ${form.theme === th ? '#e8ff47' : 'transparent'}`,
                  background: THEME_GRADIENTS[th], position:'relative', overflow:'hidden',
                  transform: form.theme === th ? 'scale(0.88)' : 'scale(1)', transition:'all 0.15s',
                }}>
                  <span style={{ position:'absolute', bottom:3, left:0, right:0, textAlign:'center', fontSize:'8px', color:'rgba(255,255,255,0.7)', fontWeight:500 }}>
                    {t(`themes.${th}`).split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </Field>
          <Field label={t('form.layout')}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
              {LAYOUTS.map(lay => (
                <button key={lay} onClick={() => set('layout', lay)} style={{
                  background: form.layout === lay ? 'rgba(232,255,71,0.08)' : 'rgba(255,255,255,0.03)',
                  border:`1px solid ${form.layout === lay ? 'rgba(232,255,71,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius:'8px', padding:'8px 4px', cursor:'pointer', textAlign:'center',
                  color: form.layout === lay ? '#e8ff47' : '#666',
                  fontSize:'11px', transition:'all 0.15s',
                }}>
                  <div style={{ fontSize:'18px', marginBottom:'2px' }}>{LAYOUT_ICONS[lay]}</div>
                  {t(`layouts.${lay}`)}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t('form.sphere')}>
            <select
              style={{ ...S.input, cursor:'pointer' }}
              value={sphereValue}
              onChange={e => handleSphereChange(e.target.value)}
            >
              {SPHERES.map(s => <option key={s} value={s}>{t(`spheres.${s}`)}</option>)}
              <option value="other">{t('form.sphere_other')}</option>
            </select>
            {isCustomSphere && (
              <input
                style={{ ...S.input, marginTop: '8px' }}
                value={form.sphere}
                onChange={e => set('sphere', e.target.value)}
                placeholder={t('form.sphere_placeholder')}
              />
            )}
          </Field>
        </div>

        {/* Action buttons */}
        <div style={{ padding:'1rem 1.2rem', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:'8px' }}>
          <button onClick={handleSubmit} disabled={isSaving} style={{
            flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:'10px', color:'#f0ede8', padding:'11px', cursor: isSaving ? 'not-allowed' : 'pointer',
            fontFamily:'DM Sans, sans-serif', fontSize:'13px', fontWeight:500, opacity: isSaving ? 0.6 : 1,
          }}>
            {isSaving ? t('form.saving') : t('form.save_btn')}
          </button>
          <button onClick={handleGenerate} disabled={isGenerating} style={{
            flex:2, background: isGenerating ? 'rgba(232,255,71,0.5)' : '#e8ff47',
            border:'none', borderRadius:'10px', color:'#0a0a0f', padding:'11px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', letterSpacing:'2px',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
          }}>
            {isGenerating ? (
              <>
                <span style={{ width:14, height:14, border:'2px solid rgba(10,10,15,0.3)', borderTopColor:'#0a0a0f', borderRadius:'50%', display:'inline-block', animation:'spin 0.6s linear infinite' }} />
                {t('form.generating')}
              </>
            ) : `✦ ${t('form.generate_btn')}`}
          </button>
        </div>
      </div>

      {/* ── RIGHT: PREVIEW ──────────────────────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {/* Toolbar */}
        <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
          <div style={{ display:'flex', gap:'4px', background:'#1a1a24', borderRadius:'8px', padding:'3px' }}>
            {[['preview', t('preview.tabs_preview')], ['code', t('preview.tabs_code')], ['mobile', t('preview.tabs_mobile')]].map(([k,l]) => (
              <button key={k} onClick={() => setPreviewTab(k)} style={{
                padding:'5px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:500,
                background: previewTab === k ? '#e8ff47' : 'transparent',
                color: previewTab === k ? '#0a0a0f' : '#666',
                border:'none', transition:'all 0.15s', fontFamily:'DM Sans, sans-serif',
              }}>{l}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:'6px' }}>
            <SmallBtn onClick={() => { if(previewHTML){ navigator.clipboard.writeText(previewHTML); } }}>
              📋 {t('preview.copy_code')}
            </SmallBtn>
            <SmallBtn onClick={downloadHTML} accent>
              💾 {t('preview.download')}
            </SmallBtn>
          </div>
        </div>

        {/* Frame */}
        <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'18px', overflow:'hidden', minHeight:580 }}>
          {/* Browser bar */}
          <div style={{ background:'#1a1a24', padding:'9px 14px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display:'flex', gap:'5px' }}>
              {['#ff5f56','#ffbd2e','#27c93f'].map(c => <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }} />)}
            </div>
            <div style={{ flex:1, background:'#0a0a0f', borderRadius:'5px', padding:'3px 12px', fontFamily:'DM Mono, monospace', fontSize:'11px', color:'#555' }}>
              {previewHTML ? `cardforge.app/c/${(form.full_name||'preview').toLowerCase().replace(/\s+/g,'-').slice(0,20)}` : 'cardforge.app/preview'}
            </div>
          </div>

          {!previewHTML ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:520, gap:'1rem', color:'#333' }}>
              <div style={{ fontSize:'3rem', opacity:0.15 }}>⬡</div>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.6rem', letterSpacing:'2px', color:'rgba(240,237,232,0.1)' }}>{t('preview.empty_title')}</div>
              <p style={{ fontSize:'12px', maxWidth:260, textAlign:'center', lineHeight:1.6, opacity:0.4 }}>{t('preview.empty_desc')}</p>
            </div>
          ) : previewTab === 'code' ? (
            <div style={{ background:'#0a0a0f', padding:'1.5rem', overflowX:'auto', maxHeight:560, overflowY:'auto' }}>
              <pre style={{ fontFamily:'DM Mono, monospace', fontSize:'12px', lineHeight:1.7, color:'#abb2bf', whiteSpace:'pre-wrap', wordBreak:'break-all', margin:0 }}>
                {previewHTML}
              </pre>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={previewHTML.slice(0,40)}
                initial={{ opacity:0, y:12 }}
                animate={{ opacity:1, y:0 }}
                transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
              >
                <iframe
                  srcDoc={previewHTML}
                  style={{
                    width: previewTab === 'mobile' ? '375px' : '100%',
                    margin: previewTab === 'mobile' ? '0 auto' : '0',
                    display: 'block',
                    border:'none',
                    minHeight: 540,
                  }}
                  title="preview"
                  onLoad={e => {
                    try {
                      const h = e.target.contentDocument?.documentElement?.scrollHeight;
                      if (h) e.target.style.height = h + 'px';
                    } catch {}
                  }}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── PROJECT MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {projectModal !== null && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setProjectModal(null)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          >
            <motion.div
              initial={{ scale:0.93, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.93 }}
              transition={{ type:'spring', stiffness:400, damping:30 }}
              onClick={e => e.stopPropagation()}
              style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', padding:'2rem', width:'100%', maxWidth:460, display:'flex', flexDirection:'column', gap:'1rem' }}
            >
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h3 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:'2px' }}>
                  {projectModal === 'new' ? 'НОВИЙ ПРОЄКТ' : 'РЕДАГУВАТИ ПРОЄКТ'}
                </h3>
                <button onClick={() => setProjectModal(null)} style={{ ...iconBtn, fontSize:'16px' }}>✕</button>
              </div>

              <Field label={t('form.project_name')}>
                <input style={S.input} value={modalData.name} onChange={e => setModalData(d=>({...d,name:e.target.value}))} placeholder="Назва проєкту" />
              </Field>
              <Field label={t('form.project_desc')}>
                <textarea style={{ ...S.input, minHeight:70, resize:'none' }} value={modalData.description} onChange={e => setModalData(d=>({...d,description:e.target.value}))} placeholder="Короткий опис..." />
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <Field label={t('form.project_link_label')}>
                  <input style={S.input} value={modalData.link_label} onChange={e => setModalData(d=>({...d,link_label:e.target.value}))} placeholder="Переглянути" />
                </Field>
                <Field label={t('form.project_link_url')}>
                  <input type="url" style={S.input} value={modalData.link_url} onChange={e => setModalData(d=>({...d,link_url:e.target.value}))} placeholder="https://..." />
                </Field>
              </div>

              {/* Image upload */}
              <Field label={t('form.project_image')}>
                <div
                  onClick={() => document.getElementById('modal-img-input').click()}
                  style={{
                    border:'1.5px dashed rgba(255,255,255,0.15)', borderRadius:'10px',
                    minHeight:90, cursor:'pointer', overflow:'hidden', position:'relative',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'border-color 0.2s',
                  }}
                >
                  <input id="modal-img-input" type="file" accept="image/*" style={{ display:'none' }} onChange={handleModalImage} />
                  {modalData.bg_preview ? (
                    <>
                      <img src={modalData.bg_preview} alt="bg" style={{ width:'100%', height:100, objectFit:'cover', display:'block' }} />
                      <button
                        onClick={e => { e.stopPropagation(); setModalData(d=>({...d,bg_image:null,bg_preview:null})); document.getElementById('modal-img-input').value=''; }}
                        style={{ position:'absolute', top:6, right:6, background:'rgba(10,10,15,0.8)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'6px', color:'#f0ede8', width:24, height:24, cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center' }}
                      >✕</button>
                    </>
                  ) : (
                    <div style={{ textAlign:'center', color:'#444', padding:'1rem', pointerEvents:'none' }}>
                      <div style={{ fontSize:'1.5rem', marginBottom:'4px' }}>🖼</div>
                      <div style={{ fontSize:'12px' }}>{t('form.upload_image')}</div>
                      <div style={{ fontSize:'10px', marginTop:'2px', color:'#333', fontFamily:'DM Mono, monospace' }}>{t('form.upload_hint')}</div>
                    </div>
                  )}
                </div>
              </Field>

              {/* Preview of link */}
              {modalData.link_url && (
                <div style={{ background:'rgba(232,255,71,0.04)', border:'1px solid rgba(232,255,71,0.1)', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#e8ff47', fontFamily:'DM Mono, monospace', wordBreak:'break-all' }}>
                  🔗 {modalData.link_label || 'Переглянути'} → {modalData.link_url}
                </div>
              )}

              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'4px' }}>
                <button onClick={() => setProjectModal(null)} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#666', padding:'9px 20px', cursor:'pointer', fontFamily:'DM Sans, sans-serif', fontSize:'13px' }}>
                  Скасувати
                </button>
                <button onClick={saveProject} style={{ background:'#e8ff47', border:'none', borderRadius:'8px', color:'#0a0a0f', padding:'9px 20px', cursor:'pointer', fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.95rem', letterSpacing:'1.5px' }}>
                  ЗБЕРЕГТИ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::-webkit-scrollbar, div::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-thumb, div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        input:focus, textarea:focus, select:focus { border-color: rgba(232,255,71,0.5) !important; }
        select option { background: #1a1a24; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
      {label && <label style={S.label}>{label}</label>}
      {children}
    </div>
  );
}

function SmallBtn({ children, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      background: accent ? 'rgba(232,255,71,0.08)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${accent ? 'rgba(232,255,71,0.2)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius:'8px', color: accent ? '#e8ff47' : '#888',
      padding:'6px 14px', cursor:'pointer', fontSize:'12px',
      fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', gap:'5px',
      transition:'all 0.15s',
    }}>{children}</button>
  );
}

const iconBtn = {
  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:'7px', padding:'4px 8px', cursor:'pointer', fontSize:'12px', transition:'all 0.15s',
};
