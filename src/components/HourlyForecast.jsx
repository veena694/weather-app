import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import GlassCard from './GlassCard';
import { convetToFahrenheit } from '../utils/Weatherutil';
import { FiTrendingUp, FiClock } from 'react-icons/fi';
import { 
  WiDaySunny, WiNightClear, WiCloudy, WiRain, WiSnow, WiThunderstorm 
} from 'react-icons/wi';

const HourlyForecast = ({ hourlyData = [], isCelsius, theme }) => {
  
  // Format the data array for Recharts
  const formattedData = hourlyData.slice(0, 24).map(item => {
    const tempVal = parseFloat(item.temp);
    const displayTemp = isCelsius ? tempVal : parseFloat(convetToFahrenheit(tempVal));
    
    return {
      time: item.time,
      temperature: displayTemp,
      code: item.code,
      humidity: item.humidity,
      rawTemp: tempVal
    };
  });

  // Custom tooltips with glass design
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/85 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-xs shadow-2xl">
          <p className="font-mono text-slate-400 mb-1 tracking-wider uppercase flex items-center gap-1">
            <FiClock /> {data.time}
          </p>
          <p className="font-temperature font-bold text-slate-100 text-sm mt-1">
            Temp: <span style={{ color: theme.accent }}>{data.temperature.toFixed(1)}°{isCelsius ? "C" : "F"}</span>
          </p>
          <p className="text-slate-400 mt-0.5">Humidity: {data.humidity || 65}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom Dot Renderer to draw SVG weather icons directly on spline vertices!
  const CustomDot = (props) => {
    const { cx, cy, payload, index } = props;
    
    // Draw icons only on alternate nodes to avoid UI crowding
    if (index % 3 !== 0) return null;

    return (
      <g transform={`translate(${cx - 10}, ${cy - 24})`}>
        <foreignObject width="20" height="20">
          <div className="w-full h-full flex items-center justify-center bg-black/30 backdrop-blur-xs border border-white/5 rounded-full" style={{ filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))' }}>
            {getMiniIcon(payload.code)}
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <GlassCard className="p-6 md:p-8" glowColor={theme.accent + '22'}>
      <div className="flex items-center justify-between text-slate-400 font-heading text-xs tracking-wider mb-6">
        <span className="flex items-center gap-2">
          <FiTrendingUp style={{ color: theme.accent }} />
          HOURLY TEMPERATURE SPLINE (24H METRICS)
        </span>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">REALTIME VARIATION</span>
      </div>

      {/* Recharts Spline Frame */}
      <div className="w-full h-64 overflow-x-auto scrollbar-hide">
        <div className="w-[800px] h-full pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 30, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="splineColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.accent} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={theme.accent} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              
              <XAxis 
                dataKey="time" 
                stroke="#475569" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
                dy={10}
                className="font-mono uppercase"
              />
              
              <YAxis 
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={-10}
                domain={['auto', 'auto']}
                className="font-mono"
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
              
              <Area 
                type="monotone" 
                dataKey="temperature" 
                stroke={theme.accent} 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#splineColor)" 
                dot={<CustomDot />}
                activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 1.5, fill: theme.accent }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
};

// Mini icon decoders
const getMiniIcon = (code) => {
  const c = "w-4 h-4";
  if (code === 0 || code === 1) return <WiDaySunny className={`${c} text-amber-400`} />;
  if (code === 2 || code === 3) return <WiCloudy className={`${c} text-slate-400`} />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <WiRain className={`${c} text-cyan-400`} />;
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <WiSnow className={`${c} text-sky-200`} />;
  return <WiThunderstorm className={`${c} text-purple-400`} />;
};

export default HourlyForecast;
