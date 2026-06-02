import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { convetToFahrenheit, getWeatherType } from '../utils/Weatherutil';
import { FiClock, FiMapPin, FiCalendar } from 'react-icons/fi';
import { 
  WiDaySunny, WiNightClear, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiStrongWind, WiHumidity 
} from 'react-icons/wi';

const WeatherCardMain = ({ currentWeather, isCelsius, theme, cityName }) => {
  const { temperature, weatherCode, isDay, windspeed, humidity } = currentWeather;
  const [countTemp, setCountTemp] = useState(0);

  const displayTemp = temperature !== undefined ? parseFloat(temperature) : 0;
  const targetTemp = isCelsius ? displayTemp : parseFloat(convetToFahrenheit(displayTemp));

  // Premium Animated Count Ticker
  useEffect(() => {
    setCountTemp(0);
    let start = 0;
    const end = targetTemp;
    if (start === end) return;

    const duration = 1200; // ms
    const increment = end > start ? 1 : -1;
    const steps = Math.abs(end);
    if (steps === 0) return;
    const stepTime = Math.max(10, duration / steps);

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        clearInterval(timer);
        setCountTemp(end);
      } else {
        setCountTemp(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetTemp]);

  const activeWeatherLabel = getWeatherType(weatherCode);

  return (
    <GlassCard 
      className="p-8 md:p-10 flex flex-col justify-between h-full min-h-[380px]" 
      glowColor={theme.accent + '33'}
    >
      {/* Header City Telemetry & Time */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 text-slate-100">
          <div 
            className="p-3 rounded-2xl flex items-center justify-center border transition-all duration-500"
            style={{ 
              backgroundColor: `${theme.accent}15`, 
              borderColor: `${theme.accent}33` 
            }}
          >
            <FiMapPin 
              className="w-5 h-5 animate-[bounce_2s_infinite] transition-colors duration-500" 
              style={{ color: theme.accent }}
            />
          </div>
          <div className="flex flex-col">
            <h2 className="font-heading font-bold text-xl tracking-tight leading-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-200">
              {cityName || "Retrieving location..."}
            </h2>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest mt-0.5">METEOROLOGICAL NODE</span>
          </div>
        </div>
        
        {/* Date Display */}
        <div className="flex flex-col items-end text-right">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <FiCalendar 
              className="w-3.5 h-3.5 transition-colors duration-500" 
              style={{ color: theme.accent }}
            />
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-1 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
        </div>
      </div>

      {/* Hero Temperature Numeral & Icon */}
      <div className="my-8 md:my-10 flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
        <div className="flex flex-col">
          <div className="flex items-baseline font-temperature font-bold leading-none tracking-tighter">
            <motion.span 
              className="text-8xl md:text-9xl bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-100 to-slate-200"
              style={{ filter: `drop-shadow(0 0 40px ${theme.accent}33)` }}
            >
              {countTemp.toFixed(1)}
            </motion.span>
            <span 
              className="text-4xl md:text-5xl font-light ml-1 transition-colors duration-500"
              style={{ color: theme.accent }}
            >
              {isCelsius ? "°C" : "°F"}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <span className="px-3.5 py-1 bg-white/[0.04] border border-white/5 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: theme.accent }} />
              {activeWeatherLabel}
            </span>
          </div>
        </div>
        
        {/* Huge Themed SVG Icon */}
        <div 
          className="relative w-36 h-36 flex items-center justify-center"
          style={{ filter: `drop-shadow(0 0 35px ${theme.accent}55)` }}
        >
          {getWeatherSVGIcon(weatherCode, isDay)}
        </div>
      </div>

      {/* Footer Metrics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5 pt-6 mt-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Wind Telemetry</span>
          <span className="text-sm font-semibold text-slate-200 flex items-center gap-1">
            <WiStrongWind 
              className="w-5 h-5 transition-colors duration-500" 
              style={{ color: theme.accent }}
            />
            {windspeed} km/h
          </span>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Relative Saturation</span>
          <span className="text-sm font-semibold text-slate-200 flex items-center gap-1">
            <WiHumidity 
              className="w-5 h-5 transition-colors duration-500" 
              style={{ color: theme.accent }}
            />
            {humidity || 68}%
          </span>
        </div>

        <div className="flex flex-col gap-1 col-span-2 font-mono">
          <span className="text-[10px] text-slate-500 tracking-widest uppercase text-right">System Telemetry Log</span>
          <span className="text-xs text-slate-400 text-right flex items-center justify-end gap-1.5">
            <FiClock 
              className="transition-colors duration-500" 
              style={{ color: theme.accent }}
            />
            Sync: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

// Weather Icon Mappings
const getWeatherSVGIcon = (code, isDay) => {
  const c = 'w-full h-full text-slate-100 animate-float';
  
  if (code === 0 || code === 1) {
    return isDay ? <WiDaySunny className={`${c} text-amber-400`} /> : <WiNightClear className={`${c} text-indigo-300`} />;
  } else if (code === 2 || code === 3 || code === 45 || code === 48) {
    return <WiCloudy className={`${c} text-slate-400`} />;
  } else if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82)
  ) {
    return <WiRain className={`${c} text-cyan-400`} />;
  } else if (
    (code >= 71 && code <= 77) ||
    (code >= 85 && code <= 86)
  ) {
    return <WiSnow className={`${c} text-sky-200`} />;
  } else if (code >= 95 && code <= 99) {
    return <WiThunderstorm className={`${c} text-purple-400`} />;
  }

  return isDay ? <WiDaySunny className={c} /> : <WiNightClear className={c} />;
};

export default WeatherCardMain;
