import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import { FiCpu, FiAlertTriangle, FiInfo, FiActivity } from 'react-icons/fi';

const AIInsights = ({ insights = [], theme }) => {
  return (
    <GlassCard className="p-6 md:p-8" glowColor={theme.accent + '22'}>
      {/* Title Header */}
      <div className="flex items-center justify-between text-slate-400 font-heading text-xs tracking-wider mb-6 border-b border-white/5 pb-4">
        <span className="flex items-center gap-2">
          <FiCpu 
            className="w-4 h-4 animate-spin-slow transition-colors duration-500" 
            style={{ color: theme.accent }}
          />
          WEATHER SYSTEMS AI ANALYSIS CONSOLE
        </span>
        <span 
          className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-md transition-all duration-500"
          style={{ 
            color: theme.accent, 
            backgroundColor: `${theme.accent}15`, 
            borderColor: `${theme.accent}33` 
          }}
        >
          REAL-TIME SYNTHESIS
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-10 text-slate-500 font-mono text-xs">
          [WAITING FOR CLIMATE DATA SYNCHRONIZATION...]
        </div>
      ) : (
        <div className="space-y-6">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              {/* Type-based Icon Indicators */}
              <div className={`p-2 rounded-xl border shrink-0 ${getBadgeStyles(insight.type)}`}>
                {getBadgeIcon(insight.type)}
              </div>

              {/* Insights Writeout */}
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="font-heading font-semibold text-xs tracking-wider uppercase text-slate-200">
                  {insight.title}
                </span>
                
                {/* Typewriter Text Element */}
                <TypewriterText text={insight.text} />
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

// Custom Typewriter Animation Hook
const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 15); // Adjust typing speed here (ms per char)

    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className="text-slate-400 text-xs font-mono tracking-wide leading-relaxed">
      {displayedText}
      {displayedText.length < text.length && (
        <span className="typewriter-cursor ml-0.5" />
      )}
    </p>
  );
};

// Styling decoders
const getBadgeStyles = (type) => {
  if (type === 'danger') return 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
  if (type === 'warning') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  if (type === 'info') return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
  return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
};

const getBadgeIcon = (type) => {
  if (type === 'danger') return <FiAlertTriangle className="w-4 h-4 animate-bounce" />;
  if (type === 'warning') return <FiAlertTriangle className="w-4 h-4" />;
  if (type === 'info') return <FiInfo className="w-4 h-4" />;
  return <FiActivity className="w-4 h-4" />;
};

export default AIInsights;
