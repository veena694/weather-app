import React from 'react';
import GlassCard from './GlassCard';
import { FiWind, FiSun, FiSunrise, FiSunset, FiTrendingUp, FiEye, FiDroplet } from 'react-icons/fi';

const MetricCard = ({ type, data, title, icon: Icon, theme }) => {
  
  // 1. WIND SPEED & DIRECTION TURBINE GAUGE
  if (type === 'wind') {
    const { speed, direction } = data || { speed: 0, direction: 0 };
    // Calculate rotation animation duration based on speed
    const spinDuration = speed > 0 ? Math.max(0.5, 30 / speed) : 0;
    
    return (
      <GlassCard className="p-6 h-full flex flex-col justify-between" glowColor={theme.accent + '22'}>
        <div className="flex items-center justify-between text-slate-400 font-heading text-xs tracking-wider">
          <span>WIND CONDITIONS</span>
          <FiWind style={{ color: theme.accent }} className="w-4 h-4" />
        </div>
        
        <div className="flex items-center justify-between my-4 gap-4">
          <div className="flex flex-col">
            <span className="font-temperature font-bold text-4xl text-slate-100">
              {speed}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">KM/H VELOCITY</span>
          </div>
          
          {/* Circular Compass Grid & Wind Turbine */}
          <div className="relative w-24 h-24 rounded-full border border-white/5 bg-black/20 flex items-center justify-center">
            {/* North Mark */}
            <span className="absolute top-1 text-[8px] font-mono text-slate-600 font-bold">N</span>
            {/* Direction Vector Arrow */}
            <div 
              className="absolute inset-2 transition-transform duration-700 ease-out"
              style={{ transform: `rotate(${direction}deg)` }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full mx-auto transition-colors duration-500" 
                style={{ backgroundColor: theme.accent }}
              />
              <div 
                className="w-0.5 h-6 mx-auto transition-all duration-500" 
                style={{ backgroundImage: `linear-gradient(to bottom, ${theme.accent}, transparent)` }}
              />
            </div>
            
            {/* 3-Blade Rotating Turbine */}
            {speed > 0 && (
              <div 
                className="absolute w-12 h-12 flex items-center justify-center"
                style={{ animation: `spin ${spinDuration}s linear infinite` }}
              >
                {/* Hub */}
                <div className="w-2 h-2 bg-slate-300 rounded-full z-10 shadow-[0_0_8px_white]" />
                {/* Blade 1 */}
                <div className="absolute top-0 w-0.5 h-6 bg-slate-400/80 origin-bottom rounded-full" />
                {/* Blade 2 */}
                <div className="absolute top-0 w-0.5 h-6 bg-slate-400/80 origin-bottom rounded-full rotate-[120deg]" />
                {/* Blade 3 */}
                <div className="absolute top-0 w-0.5 h-6 bg-slate-400/80 origin-bottom rounded-full rotate-[240deg]" />
              </div>
            )}
          </div>
        </div>
        
        <div className="text-[11px] text-slate-400 border-t border-white/5 pt-3">
          Gales blowing from <span className="font-semibold text-slate-200" style={{ color: theme.accent }}>{direction}° {getCompassHeading(direction)}</span>.
        </div>
      </GlassCard>
    );
  }

  // 2. UV INDEX GAUGES
  if (type === 'uv') {
    const uvVal = Math.round(data || 0);
    const uvPercent = Math.min(100, (uvVal / 11) * 100);
    const safetyText = getUVSafetyText(uvVal);
    
    return (
      <GlassCard className="p-6 h-full flex flex-col justify-between" glowColor={theme.accent + '22'}>
        <div className="flex items-center justify-between text-slate-400 font-heading text-xs tracking-wider">
          <span>UV INDEX</span>
          <FiSun style={{ color: theme.accent }} className="w-4 h-4" />
        </div>
        
        <div className="flex items-center justify-between my-4 gap-4">
          <div className="flex flex-col">
            <span className="font-temperature font-bold text-4xl text-slate-100">
              {uvVal}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{safetyText.level} EXPOSURE</span>
          </div>

          {/* Radial Semi-Arc Dial */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Back track */}
              <circle
                cx="40"
                cy="40"
                r="30"
                className="stroke-white/5 fill-transparent"
                strokeWidth="6"
              />
              {/* Active glow meter */}
              <circle
                cx="40"
                cy="40"
                r="30"
                className="fill-transparent transition-all duration-1000"
                style={{
                  stroke: theme.accent,
                  strokeDasharray: `${2 * Math.PI * 30}`,
                  strokeDashoffset: `${2 * Math.PI * 30 * (1 - uvPercent / 100)}`
                }}
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute font-temperature font-semibold text-sm text-slate-300">
              {uvVal}
            </div>
          </div>
        </div>
        
        <div className="text-[11px] text-slate-400 border-t border-white/5 pt-3">
          {safetyText.advice}
        </div>
      </GlassCard>
    );
  }

  // 3. SUNRISE / SUNSET SOLAR PARABOLA PATH
  if (type === 'sun') {
    const { sunrise, sunset, current } = data || { sunrise: "06:00", sunset: "18:00", current: new Date() };
    
    // Parse times to calculate solar progression percentage
    const progress = getSolarProgression(sunrise, sunset, current);
    
    return (
      <GlassCard className="p-6 h-full flex flex-col justify-between md:col-span-2" glowColor={theme.accent + '22'}>
        <div className="flex items-center justify-between text-slate-400 font-heading text-xs tracking-wider">
          <span>ASTRONOMICAL SOLAR PATH</span>
          <div className="flex gap-2">
            <FiSunrise className="w-4 h-4 text-amber-400" />
            <FiSunset className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
        
        <div className="relative h-20 my-4 flex items-end">
          {/* Dashed Trajectory Arc */}
          <div className="absolute inset-x-0 bottom-0 h-16 border-t border-dashed border-white/10 rounded-t-full mask-bottom" />
          
          {/* Solar Progress dot floating along the arc */}
          {progress >= 0 && progress <= 100 && (
            <div 
              className="absolute w-4 h-4 bg-amber-400 border border-amber-200 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.8)] z-10 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${progress}%`,
                bottom: `${Math.sin((progress / 100) * Math.PI) * 55}px` // Parabolic height curve
              }}
            />
          )}

          {/* Time markings along bottom */}
          <div className="w-full flex justify-between text-[10px] text-slate-500 font-mono pt-2">
            <div className="flex flex-col items-start">
              <span className="text-slate-400 font-semibold">{sunrise}</span>
              <span>SUNRISE</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 font-semibold">{sunset}</span>
              <span>SUNSET</span>
            </div>
          </div>
        </div>
        
        <div className="text-[11px] text-slate-400 border-t border-white/5 pt-3 flex justify-between">
          <span>Daylight Cycle Progression</span>
          <span className="font-semibold text-slate-200 font-mono">{progress.toFixed(0)}% Completed</span>
        </div>
      </GlassCard>
    );
  }

  // 4. HUMIDITY & BAROMETRIC PRESSURE
  const percentVal = Math.round(data || 0);
  
  return (
    <GlassCard className="p-6 h-full flex flex-col justify-between" glowColor={theme.accent + '22'}>
      <div className="flex items-center justify-between text-slate-400 font-heading text-xs tracking-wider">
        <span>{title.toUpperCase()}</span>
        {Icon && <Icon style={{ color: theme.accent }} className="w-4 h-4" />}
      </div>
      
      <div className="my-4">
        <span className="font-temperature font-bold text-4xl text-slate-100">
          {percentVal}
          <span className="text-lg font-normal ml-0.5 text-slate-400">
            {type === 'humidity' ? '%' : type === 'pressure' ? ' hPa' : ' km'}
          </span>
        </span>
        
        {/* Dynamic Progress indicator */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-4">
          <div 
            className="h-full rounded-full transition-all duration-1000"
            style={{ 
              width: `${Math.min(100, type === 'pressure' ? (percentVal - 950) * 1.5 : percentVal)}%`,
              backgroundColor: theme.accent
            }}
          />
        </div>
      </div>
      
      <div className="text-[11px] text-slate-400 border-t border-white/5 pt-3">
        {type === 'humidity' ? (
          percentVal > 60 ? "Humid, dense air saturation active." : "Dry, crisp atmospheric balance."
        ) : type === 'pressure' ? (
          percentVal > 1013 ? "High-pressure cellular ridge (stable sky)." : "Low-pressure barometric trough (storm risk)."
        ) : (
          percentVal > 8 ? "Optimal optical sky range conditions." : "Aerosol attenuation restricting range."
        )}
      </div>
    </GlassCard>
  );
};

// Compass heading translations
const getCompassHeading = (degree) => {
  const headings = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((degree % 360) / 45)) % 8;
  return headings[index];
};

// Solar trajectory calculation
const getSolarProgression = (sunriseStr, sunsetStr, current) => {
  try {
    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      const d = new Date(current);
      d.setHours(h, m, 0, 0);
      return d.getTime();
    };

    const rise = parseTime(sunriseStr);
    const set = parseTime(sunsetStr);
    const now = current.getTime();

    if (now < rise) return 0;
    if (now > set) return 100;
    
    return ((now - rise) / (set - rise)) * 100;
  } catch (e) {
    return 50;
  }
};

// UV Warning Synthesizer
const getUVSafetyText = (uv) => {
  if (uv >= 8) return { level: 'EXTREME', advice: 'Avoid sun. SPF 50+, wide hat, sunglasses required.' };
  if (uv >= 6) return { level: 'HIGH', advice: 'Reduce exposure. Sunscreen protection is active.' };
  if (uv >= 3) return { level: 'MODERATE', advice: 'Use cover. Wear hat and sunglasses.' };
  return { level: 'LOW', advice: 'Safe exposure levels active. No precautions.' };
};

export default MetricCard;
