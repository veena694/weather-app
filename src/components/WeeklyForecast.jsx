import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import { convetToFahrenheit, getWeatherTypeCode } from '../utils/Weatherutil';
import { FiCalendar, FiChevronDown, FiChevronUp, FiWind, FiSun, FiDroplet } from 'react-icons/fi';
import { 
  WiDaySunny, WiNightClear, WiCloudy, WiRain, WiSnow, WiThunderstorm 
} from 'react-icons/wi';

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  weekday: "short"
});

const formatDate = (date) => dateFormatter.format(new Date(date));

const WeeklyForecast = ({ weekWeather = [], isCelsius, theme }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Framer Motion Stagger Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-slate-400 font-heading text-xs tracking-wider">
        <span className="flex items-center gap-2">
          <FiCalendar style={{ color: theme.accent }} />
          EXTENDED 7-DAY CLIMATE TIMELINE
        </span>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">DRAG OR SWIPE</span>
      </div>

      {/* Horizontal Swipe Carousel Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x cursor-grab active:cursor-grabbing"
      >
        {weekWeather.map((day, i) => {
          const isExpanded = expandedIndex === i;
          const displayMax = isCelsius ? day.maxTemperature : parseFloat(convetToFahrenheit(day.maxTemperature));
          const displayMin = isCelsius ? day.minTemperature : parseFloat(convetToFahrenheit(day.minTemperature));
          
          return (
            <motion.div
              key={i}
              variants={cardVariants}
              className={`snap-start shrink-0 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-44'}`}
            >
              <div onClick={() => toggleExpand(i)} className="cursor-pointer h-full">
                <GlassCard 
                  className={`p-5 flex flex-col justify-between h-full border transition-all duration-300 ${isExpanded ? 'bg-white/[0.06]' : 'border-white/5'}`}
                  style={{
                    borderColor: isExpanded ? `${theme.accent}55` : '',
                    boxShadow: isExpanded ? `0 0 20px ${theme.accent}33` : ''
                  }}
                  glowColor={theme.accent + '22'}
                  tiltEnabled={!isExpanded}
                >
                  <div className="flex flex-col gap-1 items-center text-center">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">{formatDate(day.date).split(',')[0]}</span>
                    <span className="font-heading font-bold text-sm text-slate-200 mt-0.5">{formatDate(day.date).split(',')[1]}</span>
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 my-4 flex items-center justify-center mx-auto" style={{ filter: `drop-shadow(0 0 10px ${theme.accent}33)` }}>
                    {getMediumIcon(day.weatherCode)}
                  </div>

                  {/* Temp */}
                  <div className="flex flex-col items-center">
                    <div className="font-temperature font-bold text-lg text-slate-100">
                      {displayMax.toFixed(0)}°
                      <span className="text-slate-500 text-sm font-normal ml-1">/ {displayMin.toFixed(0)}°</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium font-heading">
                      {getWeatherTypeCode(day.weatherCode)}
                    </span>
                  </div>

                  {/* Expand Indicators */}
                  <div className="flex items-center justify-center mt-4 text-slate-500 hover:text-slate-300 transition-colors">
                    {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4 animate-bounce" />}
                  </div>

                  {/* Unfolding Expanded Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-white/5 mt-4 pt-4 flex flex-col gap-2.5 text-xs text-slate-300 font-mono"
                      >
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><FiWind /> WIND</span>
                          <span className="font-bold">{day.maxWindSpeed || 15} km/h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><FiSun /> UV LEVEL</span>
                          <span className="font-bold text-yellow-400">{day.uvIndex || 3}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><FiDroplet /> SATURATION</span>
                          <span className="font-bold text-cyan-400">{day.humidity || 62}%</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

// Weather Decoders
const getMediumIcon = (code) => {
  const c = "w-full h-full text-slate-100 animate-float";
  if (code === 0 || code === 1) return <WiDaySunny className={`${c} text-amber-400`} />;
  if (code === 2 || code === 3) return <WiCloudy className={`${c} text-slate-400`} />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <WiRain className={`${c} text-cyan-400`} />;
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <WiSnow className={`${c} text-sky-200`} />;
  return <WiThunderstorm className={`${c} text-purple-400`} />;
};

export default WeeklyForecast;
