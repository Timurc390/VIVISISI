import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const FEATURES = [
  { icon:'⚡', key:'speed',   title:'Миттєва генерація',    desc:'AI аналізує дані та створює унікальний дизайн за секунди' },
  { icon:'🎨', key:'themes',  title:'8 кольорових тем',     desc:'Від суворого мінімалізму до яскравого неону — знайди свій стиль' },
  { icon:'📐', key:'layouts', title:'6 макетів сторінок',   desc:'По центру, сайдбар, hero, картки, terminal, журнал' },
  { icon:'📱', key:'mobile',  title:'Адаптивний дизайн',    desc:'Усі сайти коректно відображаються на будь-якому пристрої' },
  { icon:'🌐', key:'i18n',    title:'3 мови інтерфейсу',    desc:'Українська, English та Русский — переключай у будь-який момент' },
  { icon:'💾', key:'export',  title:'Експорт HTML',         desc:'Завантаж готовий файл і розмісти на будь-якому хостингу' },
];

const THEMES_PREVIEW = [
  { name:'Dark Neon',    bg:'linear-gradient(135deg,#0f0f1a 0%,#1a0f2e 100%)', accent:'#e8ff47' },
  { name:'Clean Light',  bg:'linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)', accent:'#2563eb' },
  { name:'Ocean Blue',   bg:'linear-gradient(135deg,#0c1445 0%,#1a3a5c 100%)', accent:'#38bdf8' },
  { name:'Forest Green', bg:'linear-gradient(135deg,#0d1f0d 0%,#1a3a1a 100%)', accent:'#4ade80' },
  { name:'Purple Haze',  bg:'linear-gradient(135deg,#1a0d2e 0%,#2d1a4a 100%)', accent:'#a78bfa' },
  { name:'Sunset Red',   bg:'linear-gradient(135deg,#2d0a0a 0%,#4a1515 100%)', accent:'#f97316' },
];

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', color:'#f0ede8', fontFamily:'DM Sans, sans-serif', overflowX:'hidden' }}>

      {/* NAV */}
      <nav style={{ padding:'1.2rem 3rem', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)', position:'sticky', top:0, background:'rgba(10,10,15,0.92)', backdropFilter:'blur(12px)', zIndex:100 }}>
        <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.6rem', letterSpacing:'3px', color:'#e8ff47' }}>
          CARD<span style={{ color:'#f0ede8' }}>FORGE</span>
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <LanguageSwitcher />
          <Link to="/login" style={{ fontSize:'13px', color:'#888', textDecoration:'none', padding:'6px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)', transition:'all 0.2s' }}>
            {t('nav.login')}
          </Link>
          <Link to="/register" style={{ fontSize:'13px', background:'#e8ff47', color:'#0a0a0f', textDecoration:'none', padding:'7px 18px', borderRadius:'8px', fontWeight:600 }}>
            {t('nav.register')}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'6rem 3rem 4rem' }}>
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
          <p style={{ fontFamily:'DM Mono, monospace', fontSize:'11px', letterSpacing:'3px', color:'#e8ff47', textTransform:'uppercase', marginBottom:'1.2rem' }}>
            ✦ {t('hero.eyebrow')}
          </p>
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(3.5rem,9vw,7.5rem)', lineHeight:0.92, letterSpacing:'2px', marginBottom:'1.5rem' }}>
            {t('hero.title1')}<br />
            <span style={{ color:'#e8ff47' }}>{t('hero.title2')}</span><br />
            <span style={{ WebkitTextStroke:'1px rgba(240,237,232,0.25)', color:'transparent' }}>{t('hero.title3')}</span>
          </h1>
          <p style={{ fontSize:'1.05rem', color:'#666', maxWidth:520, lineHeight:1.8, marginBottom:'2.5rem' }}>
            {t('hero.desc')}
          </p>
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'3rem' }}>
            <Link to="/register" style={{ background:'#e8ff47', color:'#0a0a0f', textDecoration:'none', borderRadius:'12px', padding:'14px 32px', fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:'2px' }}>
              {t('hero.cta')}
            </Link>
            <Link to="/login" style={{ background:'rgba(255,255,255,0.04)', color:'#f0ede8', textDecoration:'none', borderRadius:'12px', padding:'14px 32px', border:'1px solid rgba(255,255,255,0.1)', fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:'2px' }}>
              {t('hero.demo')} →
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:'2.5rem', paddingTop:'2rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            {[['8', t('hero.stat_themes')], ['6', t('hero.stat_layouts')], ['∞', t('hero.stat_combos')]].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.4rem', color:'#e8ff47', lineHeight:1 }}>{num}</div>
                <div style={{ fontSize:'12px', color:'#555', marginTop:'3px' }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* THEMES PREVIEW */}
      <section style={{ padding:'2rem 3rem 4rem', maxWidth:1100, margin:'0 auto' }}>
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ duration:0.5 }}>
          <p style={{ fontFamily:'DM Mono, monospace', fontSize:'10px', letterSpacing:'3px', color:'#555', textTransform:'uppercase', marginBottom:'1.2rem' }}>ТЕМИ ОФОРМЛЕННЯ</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'10px' }}>
            {THEMES_PREVIEW.map((th, i) => (
              <motion.div key={th.name} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.06 }}
                style={{ background:th.bg, borderRadius:'12px', aspectRatio:'3/4', padding:'1rem 0.8rem', display:'flex', flexDirection:'column', justifyContent:'flex-end', position:'relative', overflow:'hidden', cursor:'default' }}
              >
                <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:28, height:28, borderRadius:'50%', background:th.accent, opacity:0.8 }} />
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.8)', position:'relative', zIndex:1 }}>{th.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:'3rem', maxWidth:1100, margin:'0 auto' }}>
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}>
          <p style={{ fontFamily:'DM Mono, monospace', fontSize:'10px', letterSpacing:'3px', color:'#555', textTransform:'uppercase', marginBottom:'2rem' }}>МОЖЛИВОСТІ</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:'1rem' }}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.key} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.07 }}
                style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'1.4rem', transition:'border-color 0.2s' }}
              >
                <div style={{ fontSize:'1.6rem', marginBottom:'0.7rem' }}>{f.icon}</div>
                <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'5px', color:'#f0ede8' }}>{f.title}</div>
                <div style={{ fontSize:'13px', color:'#555', lineHeight:1.6 }}>{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA BOTTOM */}
      <section style={{ padding:'5rem 3rem', textAlign:'center' }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
          <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(2.5rem,6vw,5rem)', letterSpacing:'2px', marginBottom:'1rem' }}>
            ГОТОВИЙ ПОЧАТИ?
          </h2>
          <p style={{ color:'#555', fontSize:'14px', marginBottom:'2rem' }}>Реєстрація займає 30 секунд — жодної кредитної картки</p>
          <Link to="/register" style={{ background:'#e8ff47', color:'#0a0a0f', textDecoration:'none', borderRadius:'12px', padding:'15px 40px', fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:'2px', display:'inline-block' }}>
            {t('hero.cta')} →
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:'1.5rem 3rem', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'12px', color:'#444' }}>
        <span>{t('footer.copy')}</span>
        <span>{t('footer.made')}</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
    </div>
  );
}
