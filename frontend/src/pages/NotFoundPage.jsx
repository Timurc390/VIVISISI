import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', color:'#f0ede8', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'2rem' }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(6rem,20vw,14rem)', lineHeight:1, color:'rgba(232,255,71,0.08)', letterSpacing:'4px' }}>404</div>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(1.5rem,4vw,2.5rem)', letterSpacing:'3px', color:'rgba(240,237,232,0.3)', marginTop:'-1rem', marginBottom:'1rem' }}>
          СТОРІНКУ НЕ ЗНАЙДЕНО
        </div>
        <p style={{ color:'#555', fontSize:'14px', marginBottom:'2rem' }}>Схоже, ця сторінка не існує або була видалена</p>
        <Link to="/" style={{ background:'#e8ff47', color:'#0a0a0f', textDecoration:'none', borderRadius:'10px', padding:'11px 28px', fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', letterSpacing:'2px' }}>
          ← НА ГОЛОВНУ
        </Link>
      </motion.div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');`}</style>
    </div>
  );
}
