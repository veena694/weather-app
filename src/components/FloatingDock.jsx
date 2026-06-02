import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCompass, FiHeart, FiVolume2, FiVolumeX, FiSearch, FiStar, FiLayers } from 'react-icons/fi';
import GlassCard from './GlassCard';

const FloatingDock = ({
  isCelsius,
  setIsCelsius,
  soundEnabled,
  setSoundEnabled,
  onGPSClick,
  onSearchFocus,
  favorites = [],
  onSelectFavorite,
  onAddFavorite,
  onRemoveFavorite,
  currentCityName,
  manualTheme,
  onSelectTheme,
  theme
}) => {
  const [showFavPopover, setShowFavPopover] = useState(false);
  const [showThemePopover, setShowThemePopover] = useState(false);

  // Check if current city is already favorited
  const isCurrentFavorited = currentCityName && favorites.some(
    fav => fav.name.toLowerCase() === currentCityName.toLowerCase()
  );

  const handleFavoriteToggle = () => {
    if (!currentCityName) return;
    if (isCurrentFavorited) {
      const favObj = favorites.find(fav => fav.name.toLowerCase() === currentCityName.toLowerCase());
      if (favObj) onRemoveFavorite(favObj);
    } else {
      onAddFavorite(currentCityName);
    }
  };

  const THEMES_LIST = [
    { key: null, label: "🛰️ Auto Telemetry", accent: "#6366f1", glow: "rgba(99, 102, 241, 0.15)" },
    { key: "clear", label: "☀️ Solar Theme", accent: "#facc15", glow: "rgba(250, 204, 21, 0.15)" },
    { key: "cloudy", label: "☁️ Silver Theme", accent: "#818cf8", glow: "rgba(129, 140, 248, 0.15)" },
    { key: "rain", label: "🌧️ Moody Theme", accent: "#60a5fa", glow: "rgba(96, 165, 250, 0.15)" },
    { key: "snow", label: "❄️ Glacial Theme", accent: "#22d3ee", glow: "rgba(34, 211, 238, 0.15)" },
    { key: "storm", label: "⚡ Electric Theme", accent: "#a855f7", glow: "rgba(168, 85, 247, 0.15)" },
    { key: "night", label: "🌌 Cosmos Theme", accent: "#818cf8", glow: "rgba(129, 140, 248, 0.15)" }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none">
      <div className="relative">
        
        {/* A. FAVORITES LIST POPOVER PANEL */}
        <AnimatePresence>
          {showFavPopover && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 md:w-80 max-h-72 overflow-y-auto z-50"
            >
              <GlassCard className="p-4" tiltEnabled={false}>
                <h3 className="font-heading font-semibold text-sm tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>FAVORITE CITIES</span>
                  <FiHeart className="text-rose-500 fill-rose-500/20" />
                </h3>
                {favorites.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No favorites saved. Click the star on the dock to save this city.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {favorites.map((fav, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          onSelectFavorite(fav);
                          setShowFavPopover(false);
                          setShowThemePopover(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-slate-100 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.05] text-sm flex items-center justify-between transition-all group"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{fav.name}</span>
                          <span className="text-[10px] text-slate-500">Lat: {fav.latitude.toFixed(2)}, Lon: {fav.longitude.toFixed(2)}</span>
                        </div>
                        <FiHeart className="text-rose-500 opacity-60 group-hover:opacity-100 transition-opacity fill-rose-500" />
                      </button>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* B. MANUAL CLIMATIC THEME OVERRIDE PANEL */}
        <AnimatePresence>
          {showThemePopover && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 md:w-72 max-h-80 overflow-y-auto z-50"
            >
              <GlassCard className="p-4" tiltEnabled={false}>
                <h3 className="font-heading font-semibold text-sm tracking-wider text-slate-400 mb-3 flex items-center justify-between border-b border-white/5 pb-2">
                  <span>SELECT CLIMATE MOOD</span>
                  <FiLayers className="text-indigo-400" />
                </h3>
                <div className="space-y-1.5 mt-2">
                  {THEMES_LIST.map((themeObj, i) => {
                    const isSelected = manualTheme === themeObj.key;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          onSelectTheme(themeObj.key);
                          setShowThemePopover(false);
                          setShowFavPopover(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all border ${
                          isSelected 
                            ? 'bg-white/[0.08] text-slate-100 border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.05)]' 
                            : 'text-slate-400 hover:text-slate-200 bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.05]'
                        }`}
                        style={{
                          boxShadow: isSelected ? `0 0 15px ${themeObj.glow}` : 'none'
                        }}
                      >
                        <span>{themeObj.label}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeObj.accent }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CORE FLOATING DOCK CONTAINER */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
          className="flex items-center gap-2 p-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.5)] cursor-default"
        >
          {/* Compass / GPS Locate Sync Button */}
          <button
            onClick={onGPSClick}
            className="glass-dock-item active"
            title="Locate Current Position"
            aria-label="Use current GPS location"
          >
            <FiCompass className="w-5 h-5 animate-pulse" />
          </button>

          {/* Quick Search trigger button */}
          <button
            onClick={onSearchFocus}
            className="glass-dock-item"
            title="Focus Atmospheric Search"
            aria-label="Focus climate search input"
          >
            <FiSearch className="w-5 h-5" />
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-1" />

          {/* Favorite List Toggle Button */}
          <button
            onClick={() => {
              setShowFavPopover(!showFavPopover);
              setShowThemePopover(false);
            }}
            className={`glass-dock-item ${showFavPopover ? 'active' : ''}`}
            title="Saved Locations"
            aria-label="Toggle saved locations list"
          >
            <FiHeart className={`w-5 h-5 ${favorites.length > 0 ? 'text-rose-400 fill-rose-500/20' : ''}`} />
          </button>

          {/* Star Active Add/Remove Favorite Button */}
          <button
            onClick={handleFavoriteToggle}
            disabled={!currentCityName}
            className={`glass-dock-item ${isCurrentFavorited ? 'active' : ''} disabled:opacity-30 disabled:pointer-events-none`}
            title={isCurrentFavorited ? "Remove from Favorites" : "Add to Favorites"}
            aria-label={isCurrentFavorited ? "Remove current city from favorites" : "Add current city to favorites"}
          >
            <FiStar className={`w-5 h-5 ${isCurrentFavorited ? 'text-yellow-400 fill-yellow-500/20' : ''}`} />
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-1" />

          {/* Climatic Theme Palette Toggle Button */}
          <button
            onClick={() => {
              setShowThemePopover(!showThemePopover);
              setShowFavPopover(false);
            }}
            className={`glass-dock-item ${showThemePopover || manualTheme !== null ? 'active' : ''}`}
            title="Climatic Theme Overrides"
            aria-label="Toggle manual climate theme overrides"
          >
            <FiLayers 
              className="w-5 h-5 transition-colors duration-300" 
              style={manualTheme !== null ? { color: theme?.accent, fill: `${theme?.accent}40` } : {}}
            />
          </button>

          {/* Metric Toggle Button */}
          <button
            onClick={() => setIsCelsius(!isCelsius)}
            className="glass-dock-item text-xs font-semibold w-11 h-11 flex items-center justify-center font-temperature"
            title="Toggle Metric Unit"
            aria-label="Switch temperature scale between Celsius and Fahrenheit"
          >
            {isCelsius ? "°F" : "°C"}
          </button>

          {/* Volume Sound System Toggle Button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`glass-dock-item ${soundEnabled ? 'active' : ''}`}
            title="Toggle Ambient Audio"
            aria-label={soundEnabled ? "Mute ambient climate audio loops" : "Unmute ambient climate audio loops"}
          >
            {soundEnabled ? (
              <FiVolume2 className="w-5 h-5 transition-colors" style={{ color: theme?.accent }} />
            ) : (
              <FiVolumeX className="w-5 h-5" />
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default FloatingDock;
