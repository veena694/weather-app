import React, { useState, useRef } from 'react';

const GlassCard = ({ 
  children, 
  className = "", 
  tiltEnabled = true, 
  glowColor = "rgba(99, 102, 241, 0.12)"
}) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowStyle, setGlowStyle] = useState({ opacity: 0, left: '0px', top: '0px' });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate cursor position relative to card boundaries
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Dynamic Spotlight Glow
    setGlowStyle({
      opacity: 1,
      left: `${x}px`,
      top: `${y}px`,
      background: `radial-gradient(circle 120px at ${x}px ${y}px, ${glowColor}, transparent 80%)`
    });

    if (!tiltEnabled) return;
    
    // Parallax calculations (ranges from -1 to 1)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -6; // Maximum 6 deg tilt
    const rotateYValue = ((x - centerX) / centerX) * 6;  // Maximum 6 deg tilt
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setGlowStyle({ opacity: 0, left: '0px', top: '0px' });
    if (!tiltEnabled) return;
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-card relative overflow-hidden transition-all duration-200 ${className}`}
      style={{
        transform: tiltEnabled ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)` : 'none',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Dynamic Cursor Glow Layer */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={glowStyle}
      />
      
      {/* Decorative Border Gradient */}
      <div className="absolute inset-0 rounded-3xl border border-white/[0.04] pointer-events-none z-10" />

      {/* Content wrapper with perspective preservation */}
      <div style={{ transform: 'translateZ(20px)' }} className="relative z-20 h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
