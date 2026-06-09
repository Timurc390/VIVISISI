import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cardsApi } from '../api';

export default function PublicCardPage() {
  const { slug } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    cardsApi.getPublic(slug)
      .then(r => setCard(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:'#555' }}>
        <div style={{ width:32, height:32, border:'2px solid rgba(232,255,71,0.3)', borderTopColor:'#e8ff47', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 1rem' }} />
        <div style={{ fontFamily:'DM Mono, monospace', fontSize:'12px', letterSpacing:'2px' }}>ЗАВАНТАЖЕННЯ...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans, sans-serif', color:'#f0ede8', flexDirection:'column', gap:'1rem' }}>
      <div style={{ fontSize:'4rem', opacity:0.2 }}>⬡</div>
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', letterSpacing:'3px', color:'rgba(240,237,232,0.3)' }}>ВІЗИТКУ НЕ ЗНАЙДЕНО</div>
      <Link to="/" style={{ color:'#e8ff47', fontSize:'13px', textDecoration:'none' }}>← На головну</Link>
    </div>
  );

  // If we have generated HTML — render it in an iframe fullscreen
  if (card?.generated_html) {
    return (
      <>
        {/* Branding strip */}
        <motion.div
          initial={{ opacity:0, y:-20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.5 }}
          style={{
            position:'fixed', top:0, left:0, right:0, zIndex:9999,
            background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)',
            borderBottom:'1px solid rgba(255,255,255,0.07)',
            padding:'8px 20px', display:'flex', alignItems:'center', justifyContent:'space-between',
            fontFamily:'DM Sans, sans-serif',
          }}
        >
          <Link to="/" style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:'2px', color:'#e8ff47', textDecoration:'none' }}>
            CARD<span style={{ color:'#f0ede8' }}>FORGE</span>
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ fontSize:'12px', color:'#555' }}>
              👁 {card.views_count} переглядів
            </span>
            <Link to="/" style={{
              background:'#e8ff47', color:'#0a0a0f', textDecoration:'none',
              borderRadius:'8px', padding:'5px 14px',
              fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.85rem', letterSpacing:'1.5px',
            }}>
              СТВОРИТИ СВОЮ
            </Link>
          </div>
        </motion.div>

        <motion.iframe
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ duration:0.4 }}
          srcDoc={card.generated_html}
          style={{ width:'100%', height:'100vh', border:'none', display:'block', paddingTop:42 }}
          title={`${card.full_name} — ${card.role}`}
        />
      </>
    );
  }

  // Fallback: plain card if no HTML generated yet
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', color:'#f0ede8', fontFamily:'DM Sans, sans-serif' }}>
      <div style={{ maxWidth:700, margin:'0 auto', padding:'4rem 2rem', textAlign:'center' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <div style={{ width:80, height:80, background:'#e8ff47', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', color:'#0a0a0f' }}>
            {(card.full_name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(2.5rem,6vw,4rem)', letterSpacing:'2px', marginBottom:'0.3rem' }}>{card.full_name}</h1>
          <div style={{ color:'#e8ff47', fontSize:'1.1rem', marginBottom:'1.5rem' }}>{card.role}</div>
          {card.bio && <p style={{ color:'#888', lineHeight:1.7, marginBottom:'2rem', maxWidth:500, margin:'0 auto 2rem' }}>{card.bio}</p>}

          {/* Skills */}
          {card.skills?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center', marginBottom:'2.5rem' }}>
              {card.skills.map(s => (
                <span key={s} style={{ padding:'5px 14px', borderRadius:'100px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', fontSize:'13px', color:'#aaa' }}>{s}</span>
              ))}
            </div>
          )}

          {/* Contacts */}
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center' }}>
            {card.email && <ContactBtn href={`mailto:${card.email}`}>✉ {card.email}</ContactBtn>}
            {card.telegram && <ContactBtn href={`https://t.me/${card.telegram.replace('@','')}`}>✈ {card.telegram}</ContactBtn>}
            {card.github && <ContactBtn href={`https://${card.github}`}>⬡ {card.github}</ContactBtn>}
            {card.linkedin && <ContactBtn href={`https://${card.linkedin}`}>💼 LinkedIn</ContactBtn>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ContactBtn({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      padding:'8px 18px', borderRadius:'10px', background:'rgba(255,255,255,0.05)',
      border:'1px solid rgba(255,255,255,0.1)', color:'#f0ede8', textDecoration:'none',
      fontSize:'13px', transition:'all 0.2s', display:'inline-flex', alignItems:'center', gap:'6px',
    }}>
      {children}
    </a>
  );
}
