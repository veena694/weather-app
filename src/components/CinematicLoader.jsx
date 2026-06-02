import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_MESSAGES = [
  "CONNECTING METEOROLOGICAL TELEMETRY...",
  "SCANNING IONOSPHERE SPECTRA...",
  "SYNTHESIZING ATMOSPHERIC COMPRESSION...",
  "RESOLVING SPATIAL COORDINATES...",
  "COMPILING 3D ATMOSPHERIC RENDER FRAME...",
  "SYSTEM ONLINE // DEPLOYING VIEWER"
];

const CinematicLoader = ({ isLoading, onRevealComplete }) => {
  const [percent, setPercent] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Rapid percent counter simulation
  useEffect(() => {
    if (!isLoading) {
      setPercent(100);
      setStatusIdx(STATUS_MESSAGES.length - 1);
      const timer = setTimeout(() => {
        setIsRevealed(true);
        if (onRevealComplete) onRevealComplete();
      }, 600);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        // Random incremental hops
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isLoading, onRevealComplete]);

  // Telemetry status sequential indexing
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setStatusIdx((prev) => {
        if (prev < STATUS_MESSAGES.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {!isRevealed && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(30px)' }}
          transition={{ duration: 1.0, ease: [0.83, 0, 0.17, 1] }}
          className="fixed inset-0 w-full h-full bg-[#06070a] z-[9999] flex flex-col items-center justify-center select-none"
        >
          {/* Volumetric Glowing Ambient Lights */}
          <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none" />

          {/* Interactive CSS 3D Wireframe Globe */}
          <div className="relative w-48 h-48 mb-12 flex items-center justify-center perspective-container">
            <div className="absolute w-40 h-40 border border-indigo-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute w-40 h-40 border border-dashed border-indigo-500/10 rounded-full animate-[spin_16s_linear_infinite_reverse]" />
            
            {/* Latitude Ring */}
            <div 
              className="absolute w-40 h-40 border border-indigo-500/30 rounded-full animate-[spin_8s_linear_infinite]"
              style={{ transform: 'rotateY(75deg)' }}
            />
            {/* Longitude Ring */}
            <div 
              className="absolute w-40 h-40 border border-indigo-500/30 rounded-full animate-[spin_12s_linear_infinite]"
              style={{ transform: 'rotateX(75deg)' }}
            />
            {/* Pulsing Core */}
            <div className="absolute w-8 h-8 bg-indigo-500/25 rounded-full blur-sm animate-ping" />
            <div className="absolute w-5 h-5 bg-indigo-500 border border-indigo-300/40 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
          </div>

          {/* Large Numerics Ticker */}
          <div className="font-temperature font-bold text-6xl md:text-7xl text-slate-100 tracking-tight flex items-baseline gap-1">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400">
              {percent.toString().padStart(3, '0')}
            </span>
            <span className="text-indigo-500/60 text-2xl">%</span>
          </div>

          {/* Staged Console Telemetry Log */}
          <div className="mt-8 flex flex-col items-center gap-2 px-6">
            <p className="font-heading font-medium tracking-[0.2em] text-xs text-indigo-400 animate-pulse text-center">
              {STATUS_MESSAGES[statusIdx]}
            </p>
            <div className="w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden mt-4">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                style={{ width: `${percent}%` }}
                layout
              />
            </div>
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-4">
              WEATHER SYSTEMS CORE // V0.1.0-ALPHATHEME
            </span>
          </div>

          {/* Fog Reveal Border Overlays */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#06070a] to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#06070a] to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CinematicLoader;
