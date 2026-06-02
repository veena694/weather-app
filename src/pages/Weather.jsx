import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMic, FiCompass, FiHeart, FiActivity, FiArrowDown, FiEye, FiDroplet } from 'react-icons/fi';
import { WiThermometer, WiBarometer, WiHumidity } from 'react-icons/wi';

// Import Custom Modular Components
import GlassCard from '../components/GlassCard';
import BackgroundVideos from '../components/BackgroundVideos';
import FloatingDock from '../components/FloatingDock';
import CinematicLoader from '../components/CinematicLoader';
import WeatherCardMain from '../components/WeatherCardMain';
import HourlyForecast from '../components/HourlyForecast';
import WeeklyForecast from '../components/WeeklyForecast';
import MetricCard from '../components/MetricCard';
import AIInsights from '../components/AIInsights';
import EarthGlobe3D from '../components/EarthGlobe3D';
import WeatherBackground3D from '../components/WeatherBackground3D';

// Import Weather Telemetry APIs and Utilities
import getWeather, { searchCity } from '../api/WeatherApi';
import { getWeatherTheme, synthesizeAIInsights, WEATHER_THEMES } from '../utils/Weatherutil';

// Setup Speech Recognition Web APIs
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Weather = () => {
  // 1. Weather Telemetry States
  const [todayWeather, setTodayWeather] = useState({});
  const [weekWeather, setWeekWeather] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [currentCoords, setCurrentCoords] = useState(null); // { lat, lon }
  const [cityName, setCityName] = useState("");

  // 2. Global Controller States
  const [isCelsius, setIsCelsius] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loaderComplete, setLoaderComplete] = useState(false);
  const [firstSearchCompleted, setFirstSearchCompleted] = useState(false);
  const [manualTheme, setManualTheme] = useState(null);

  // 3. City Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const [voiceListening, setVoiceListening] = useState(false);

  // 4. Favorites List States (LocalStorage Persisted)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('AETHER_FAVORITES');
    return saved ? JSON.parse(saved) : [
      { name: "Tokyo", latitude: 35.6762, longitude: 139.6503 },
      { name: "Paris", latitude: 48.8566, longitude: 2.3522 },
      { name: "Reykjavik", latitude: 64.1466, longitude: -21.9426 }
    ];
  });

  // 5. Audio loop references
  const audioRef = useRef(null);
  const searchInputRef = useRef(null);

  // Mapped Typing search placeholder carousels
  const PLACEHOLDERS = ["Search Paris...", "Search Tokyo...", "Search Reykjavik...", "Search Cairo...", "Search Sydney..."];

  // Placeholder typing carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Sync favorites in localStorage
  useEffect(() => {
    localStorage.setItem('AETHER_FAVORITES', JSON.stringify(favorites));
  }, [favorites]);

  // Audio Loop Stream Player & Volume Crossfader
  const activeTheme = useMemo(() => {
    if (manualTheme && WEATHER_THEMES[manualTheme]) {
      return WEATHER_THEMES[manualTheme];
    }
    return getWeatherTheme(todayWeather.weatherCode, todayWeather.isDay);
  }, [manualTheme, todayWeather.weatherCode, todayWeather.isDay]);
  
  useEffect(() => {
    // If sound is enabled and theme audio exists, play
    if (soundEnabled && activeTheme?.audio) {
      // Fade out previous audio if exists
      if (audioRef.current) {
        let aud = audioRef.current;
        let fadeOut = setInterval(() => {
          if (aud.volume > 0.05) {
            aud.volume -= 0.05;
          } else {
            clearInterval(fadeOut);
            aud.pause();
          }
        }, 50);
      }

      // Initialize new audio clip
      const newAudio = new Audio(activeTheme.audio);
      newAudio.loop = true;
      newAudio.volume = 0;
      audioRef.current = newAudio;
      
      newAudio.play().then(() => {
        // Fade in new audio
        let fadeIn = setInterval(() => {
          if (newAudio.volume < 0.3) {
            newAudio.volume += 0.02;
          } else {
            clearInterval(fadeIn);
          }
        }, 50);
      }).catch(err => console.log("Audio autoplay blocked by browser policy until interaction."));
    } else {
      // Fade out and pause current audio
      if (audioRef.current) {
        let aud = audioRef.current;
        let fadeOut = setInterval(() => {
          if (aud.volume > 0.02) {
            aud.volume -= 0.02;
          } else {
            clearInterval(fadeOut);
            aud.pause();
            audioRef.current = null;
          }
        }, 50);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [soundEnabled, activeTheme.audio]);

  // Futuristic Text-To-Speech Telemetry Broadcaster
  useEffect(() => {
    if (!soundEnabled || !firstSearchCompleted || !cityName) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const triggerVoiceBroadcast = () => {
      if (!('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel(); // Terminate existing narration

      const activeLabel = getWeatherTheme(todayWeather.weatherCode, todayWeather.isDay).label;
      const displayTemp = todayWeather.temperature !== undefined ? parseFloat(todayWeather.temperature) : 0;
      const targetTemp = isCelsius ? displayTemp : parseFloat(convetToFahrenheit(displayTemp));
      const unitText = isCelsius ? "Celsius" : "Fahrenheit";
      const aiInsightText = parsedAIInsights.length > 0 ? parsedAIInsights[0].text : "";

      const text = `Weather Systems online. Telemetry synchronized for ${cityName}. Temperature registers ${targetTemp.toFixed(0)} degrees ${unitText}, displaying ${activeLabel} conditions. System analysis suggests: ${aiInsightText}`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92; // Slightly slower for high-tech cinematic narration
      utterance.pitch = 1.0;

      // Select system voice
      const voices = window.speechSynthesis.getVoices();
      const systemVoice = voices.find(
        v => v.name.includes('Google US English') || v.name.includes('Microsoft Zira') || v.name.includes('Samantha') || v.lang.startsWith('en')
      );
      if (systemVoice) {
        utterance.voice = systemVoice;
      }

      window.speechSynthesis.speak(utterance);
    };

    // Delay slightly to let the ambient audio fade in first
    const timer = setTimeout(triggerVoiceBroadcast, 1200);
    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [soundEnabled, cityName, isCelsius, todayWeather.weatherCode]);

  // Auto-fetch current coordinates on launch
  useEffect(() => {
    handleLocateCurrentPosition();
  }, []);

  // Global cursor follow trail mouse tracking listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      const trail = document.querySelector('.cursor-trail');
      if (trail) {
        trail.style.left = `${e.clientX}px`;
        trail.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch coordinates weather telemetry
  const fetchWeatherForCoords = async (lat, lon, nameLabel) => {
    setIsLoading(true);
    setLoaderComplete(false);
    try {
      const data = await getWeather({ latitude: lat, longitude: lon });
      
      // Parse current daily forecast values with absolute safety fallbacks
      let fetchWeatherInfo = [];
      if (data.daily && data.daily.time) {
        for (let i = 0; i < data.daily.time.length; i++) {
          const uvVal = data.daily.uv_index_max ? data.daily.uv_index_max[i] : 3;
          const wSpeed = data.daily.wind_speed_10m_max ? data.daily.wind_speed_10m_max[i] : (data.daily.windspeed_10m_max ? data.daily.windspeed_10m_max[i] : 15);
          
          fetchWeatherInfo.push({
            date: new Date(data.daily.time[i]),
            maxTemperature: data.daily.temperature_2m_max ? data.daily.temperature_2m_max[i] : 0,
            minTemperature: data.daily.temperature_2m_min ? data.daily.temperature_2m_min[i] : 0,
            weatherCode: data.daily.weather_code ? data.daily.weather_code[i] : (data.daily.weathercode ? data.daily.weathercode[i] : 0),
            uvIndex: uvVal !== undefined ? uvVal : 3,
            sunrise: (data.daily.sunrise && data.daily.sunrise[i]) ? data.daily.sunrise[i].split("T")[1] : "06:00",
            sunset: (data.daily.sunset && data.daily.sunset[i]) ? data.daily.sunset[i].split("T")[1] : "18:00",
            maxWindSpeed: wSpeed !== undefined ? wSpeed : 15
          });
        }
      }
      setWeekWeather(fetchWeatherInfo);

      // Parse hourly values (24H timeline) with absolute safety fallbacks
      let hourlyList = [];
      if (data.hourly && data.hourly.time) {
        for (let j = 0; j < Math.min(24, data.hourly.time.length); j++) {
          const timeObj = new Date(data.hourly.time[j]);
          const hrTemp = data.hourly.temperature_2m ? data.hourly.temperature_2m[j] : 0;
          const hrCode = data.hourly.weather_code ? data.hourly.weather_code[j] : (data.hourly.weathercode ? data.hourly.weathercode[j] : 0);
          const hrHum = data.hourly.relative_humidity_2m ? data.hourly.relative_humidity_2m[j] : 60;
          
          hourlyList.push({
            time: timeObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            temp: hrTemp,
            code: hrCode,
            humidity: hrHum
          });
        }
      }
      setHourlyForecast(hourlyList);

      // Parse current active values with absolute safety fallbacks
      let cur = data.current_weather || {};
      cur.time = cur.time ? new Date(cur.time) : new Date();
      cur.isDay = cur.is_day === 1 || cur.is_day === undefined || cur.is_day === true;
      cur.weatherCode = cur.weather_code !== undefined ? cur.weather_code : (cur.weathercode !== undefined ? cur.weathercode : 0);
      cur.windspeed = cur.wind_speed !== undefined ? cur.wind_speed : (cur.windspeed !== undefined ? cur.windspeed : 0);
      
      // Extra current day metrics mapping
      cur.humidity = (data.hourly && data.hourly.relative_humidity_2m) ? data.hourly.relative_humidity_2m[0] : 68;
      cur.uvIndex = (data.daily && data.daily.uv_index_max) ? data.daily.uv_index_max[0] : 3;
      cur.sunrise = (data.daily && data.daily.sunrise && data.daily.sunrise[0]) ? data.daily.sunrise[0].split("T")[1] : "06:00";
      cur.sunset = (data.daily && data.daily.sunset && data.daily.sunset[0]) ? data.daily.sunset[0].split("T")[1] : "18:00";
      cur.visibility = 10; // Default visibility km
      cur.pressure = 1013; // Default pressure hPa

      setTodayWeather(cur);
      setCurrentCoords({ lat, lon });
      setCityName(nameLabel);
      setFirstSearchCompleted(true);
    } catch (error) {
      console.error("Telemetry fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // GPS Geolocation Handler
  const handleLocateCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          fetchWeatherForCoords(latitude, longitude, "CURRENT POSITION");
        },
        (err) => {
          console.log("GPS search denied or failed, waiting for user input.");
        }
      );
    }
  };

  // geocoding search suggestions trigger
  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      const results = await searchCity(val);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // City suggestion click handler
  const handleSelectSuggestion = (city) => {
    const label = `${city.name}, ${city.country || city.admin1 || ""}`;
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    fetchWeatherForCoords(city.latitude, city.longitude, label);
  };

  // Search input focus helper
  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      // Scroll smoothly to top of search dock
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Geocoding Voice recognition trigger
  const triggerVoiceSearch = () => {
    if (!SpeechRecognition) {
      alert("Browser speech recognition is not supported in this client. Please search via typing.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setVoiceListening(true);
    };

    recognition.onerror = (e) => {
      console.error("Voice capture error:", e);
      setVoiceListening(false);
    };

    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.onresult = async (event) => {
      const speechToText = event.results[0][0].transcript;
      setSearchQuery(speechToText);
      setVoiceListening(false);
      
      const results = await searchCity(speechToText);
      if (results && results.length > 0) {
        handleSelectSuggestion(results[0]);
      } else {
        alert(`Could not resolve coordinates for: "${speechToText}"`);
      }
    };

    recognition.start();
  };

  // Favorites List addition / removal handlers
  const handleAddFavorite = (name) => {
    if (!currentCoords || favorites.some(fav => fav.name.toLowerCase() === name.toLowerCase())) return;
    setFavorites([
      ...favorites,
      { name, latitude: currentCoords.lat, longitude: currentCoords.lon }
    ]);
  };

  const handleRemoveFavorite = (favToRemove) => {
    setFavorites(favorites.filter(fav => fav.name.toLowerCase() !== favToRemove.name.toLowerCase()));
  };

  const handleSelectFavorite = (fav) => {
    fetchWeatherForCoords(fav.latitude, fav.longitude, fav.name);
  };

  // Compile local data variables to drive the AIinsights (Performance Memoized)
  const parsedAIInsights = useMemo(() => {
    const synthesisInputData = {
      current: {
        temp: todayWeather.temperature,
        code: todayWeather.weatherCode,
        wind: todayWeather.windspeed,
        humidity: todayWeather.humidity,
        uv: todayWeather.uvIndex
      }
    };
    return synthesizeAIInsights(synthesisInputData, isCelsius);
  }, [todayWeather, isCelsius]);

  return (
    <>
      {/* 1. Cinematic Loading Screen Layer */}
      <CinematicLoader isLoading={isLoading} onRevealComplete={() => setLoaderComplete(true)} />

      {/* 2. Dynamic looping video backdrops */}
      <BackgroundVideos theme={activeTheme} />

      {/* 3. GPU particle weather simulator background */}
      {firstSearchCompleted && <WeatherBackground3D theme={activeTheme} />}

      {/* Core UI Container Grid */}
      <div className={`relative min-h-screen z-10 w-full flex flex-col justify-between pb-36 transition-all duration-1000 ${activeTheme.isLight ? 'light-theme-contrast' : ''}`}>
        
        {/* Custom cursor follow trail with active accent glow color */}
        <div 
          className="cursor-trail hidden lg:block animate-pulse pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${activeTheme.accent}1f 0%, ${activeTheme.accent}00 70%)`
          }}
        />

        {/* Dynamic mesh lines layer */}
        <div className="absolute inset-0 w-full h-full mesh-grid -z-10" />

        {/* Global Body Container */}
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-10 flex flex-col items-center">
          
          {/* SEARCH DOCK (Part of Hero Atmosphere) */}
          <div className="w-full max-w-2xl relative mb-12 select-none">
            <div className="relative">
              {/* Outer Glowing Ring */}
              <div 
                className="absolute -inset-0.5 rounded-full blur opacity-35 transition-all duration-500" 
                style={{
                  background: `linear-gradient(to right, ${activeTheme.accent}, #c084fc)`
                }}
              />
              
              <div className="relative flex items-center bg-black/45 backdrop-blur-2xl border border-white/10 rounded-full pl-6 pr-3 py-2 shadow-2xl">
                <FiSearch className="text-slate-400 w-5 h-5 mr-3 shrink-0" />
                <label htmlFor="atmospheric-search" className="sr-only">Search atmospheric target city</label>
                <input
                  id="atmospheric-search"
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={voiceListening ? "Listening to climate target..." : PLACEHOLDERS[typingIndex]}
                  className="bg-transparent outline-none border-none text-slate-100 placeholder-slate-500 w-full text-sm font-medium tracking-wide"
                />

                {/* Voice capture button */}
                <button
                  onClick={triggerVoiceSearch}
                  className={`p-2.5 rounded-full hover:bg-white/[0.05] border border-transparent hover:border-white/5 text-slate-400 hover:text-slate-100 transition-all`}
                  style={voiceListening ? {
                    backgroundColor: `${activeTheme.accent}33`,
                    color: activeTheme.accent,
                    borderColor: `${activeTheme.accent}55`
                  } : {}}
                  title="Atmospheric Voice Query"
                  aria-label="Search target city by voice command"
                >
                  <FiMic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* suggestions autocompleter dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-x-0 top-16 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-3 shadow-2xl z-50 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((city, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion(city)}
                      className="w-full text-left px-4 py-3 rounded-2xl text-slate-200 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent hover:border-white/[0.05] text-xs font-mono flex items-center justify-between transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm font-heading tracking-wide">{city.name}</span>
                        <span className="text-slate-500 text-[10px] mt-0.5">{city.admin1 || city.country_code}, {city.country}</span>
                      </div>
                      <FiActivity className="opacity-60 transition-colors" style={{ color: activeTheme.accent }} />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STORYTELLING PAGE CONTENT */}
          <AnimatePresence mode="wait">
            {!firstSearchCompleted ? (
              
              // A. EMPTY INITIAL WELCOME ATMOSPHERE SCREEN
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-lg text-center flex flex-col items-center py-12"
              >
                {/* 3D Rotating Outline CSS Globe */}
                <div className="relative w-44 h-44 mb-8 flex items-center justify-center perspective-container">
                  <div 
                    className="absolute w-36 h-36 border border-dashed rounded-full animate-spin-slow" 
                    style={{ borderColor: `${activeTheme.accent}33` }}
                  />
                  <div 
                    className="absolute w-36 h-36 border rounded-full animate-[spin_10s_linear_infinite]"
                    style={{ transform: 'rotateY(60deg)', borderColor: `${activeTheme.accent}1a` }}
                  />
                  <div 
                    className="absolute w-36 h-36 border rounded-full animate-[spin_6s_linear_infinite]"
                    style={{ transform: 'rotateX(60deg)', borderColor: `${activeTheme.accent}1a` }}
                  />
                  <div 
                    className="absolute w-4 h-4 rounded-full blur-xs animate-ping" 
                    style={{ backgroundColor: `${activeTheme.accent}66` }}
                  />
                </div>

                <h1 
                  className="font-heading font-extrabold text-3xl md:text-4xl text-slate-100 tracking-tight leading-tight uppercase bg-clip-text text-transparent transition-all duration-500"
                  style={{
                    backgroundImage: `linear-gradient(to right, #f8fafc, ${activeTheme.accent})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  WEATHER SYSTEMS
                </h1>
                
                <p className="mt-4 text-xs font-mono text-slate-500 max-w-sm tracking-wide leading-relaxed">
                  Weather Systems telemetry terminal offline. Type a city coordinates in the search dock above or toggle your geolocation device to scan climate vectors.
                </p>

                <button
                  onClick={handleLocateCurrentPosition}
                  className="mt-8 flex items-center gap-2 px-5 py-3 rounded-full border text-xs font-semibold uppercase tracking-widest text-slate-100 transition-all scale-hover hover:-translate-y-0.5 active:translate-y-0 duration-200"
                  style={{
                    backgroundColor: activeTheme.accent,
                    borderColor: `${activeTheme.accent}aa`,
                    boxShadow: `0 0 20px ${activeTheme.accent}55`
                  }}
                >
                  <FiCompass className="w-4 h-4 animate-spin-slow" />
                  SCAN NEAREST GRID
                </button>
              </motion.div>

            ) : (
              
              // B. STORYTELLING DASHBOARD VIEW
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full flex flex-col gap-10 mt-2"
              >
                
                {/* 1. HERO ATMOSPHERE SECTION (Fullscreen-like visual flow) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Current conditions central card */}
                  <div className="lg:col-span-2">
                    <WeatherCardMain
                      currentWeather={todayWeather}
                      isCelsius={isCelsius}
                      theme={activeTheme}
                      cityName={cityName}
                    />
                  </div>
                  
                  {/* Interactive R3F 3D rotating earth globe */}
                  <div className="lg:col-span-1">
                    {currentCoords && (
                      <EarthGlobe3D
                        latitude={currentCoords.lat}
                        longitude={currentCoords.lon}
                        theme={activeTheme}
                      />
                    )}
                  </div>
                </div>

                {/* Arrow Scroll prompt overlay */}
                <div className="flex flex-col items-center justify-center my-2 text-slate-500 text-[10px] tracking-widest uppercase font-mono animate-bounce select-none pointer-events-none">
                  <span>Scroll Down for Telemetry Detail</span>
                  <FiArrowDown className="w-3.5 h-3.5 mt-1" />
                </div>

                {/* 2. HOURLY FORECAST (Curved splines) */}
                <div className="w-full">
                  <HourlyForecast
                    hourlyData={hourlyForecast}
                    isCelsius={isCelsius}
                    theme={activeTheme}
                  />
                </div>

                {/* 3. WEEKLY CLIMATE CAROUSEL */}
                <div className="w-full">
                  <WeeklyForecast
                    weekWeather={weekWeather}
                    isCelsius={isCelsius}
                    theme={activeTheme}
                  />
                </div>

                {/* 4. BENTO ENVIRONMENT DETAILS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Wind Compass */}
                  <MetricCard
                    type="wind"
                    data={{ speed: todayWeather.windspeed, direction: 210 }}
                    theme={activeTheme}
                  />

                  {/* UV Gauge */}
                  <MetricCard
                    type="uv"
                    data={todayWeather.uvIndex}
                    theme={activeTheme}
                  />

                  {/* Solar Arc sunrise/set */}
                  <MetricCard
                    type="sun"
                    data={{ sunrise: todayWeather.sunrise, sunset: todayWeather.sunset, current: new Date() }}
                    theme={activeTheme}
                  />

                  {/* Dynamic humidity meter */}
                  <MetricCard
                    type="humidity"
                    data={todayWeather.humidity}
                    title="Humidity"
                    icon={FiDroplet}
                    theme={activeTheme}
                  />

                  {/* Dynamic barometric pressure */}
                  <MetricCard
                    type="pressure"
                    data={todayWeather.pressure}
                    title="Barometer"
                    icon={WiBarometer}
                    theme={activeTheme}
                  />

                  {/* Dynamic temperature feeling metric */}
                  <MetricCard
                    type="feels"
                    data={todayWeather.temperature}
                    title="Atmosphere Index"
                    icon={WiThermometer}
                    theme={activeTheme}
                  />

                  {/* Dynamic visibility range metric */}
                  <MetricCard
                    type="visibility"
                    data={todayWeather.visibility}
                    title="Visibility Range"
                    icon={FiEye}
                    theme={activeTheme}
                  />
                </div>

                {/* 5. DYNAMIC AI METEOROLOGICAL CONSOLE */}
                <div className="w-full">
                  <AIInsights
                    insights={parsedAIInsights}
                    theme={activeTheme}
                  />
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* 4. Floating glass central navigation bar */}
        {firstSearchCompleted && (
          <FloatingDock
            isCelsius={isCelsius}
            setIsCelsius={setIsCelsius}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            onGPSClick={handleLocateCurrentPosition}
            onSearchFocus={focusSearchInput}
            favorites={favorites}
            onSelectFavorite={handleSelectFavorite}
            onAddFavorite={handleAddFavorite}
            onRemoveFavorite={handleRemoveFavorite}
            currentCityName={cityName}
            manualTheme={manualTheme}
            onSelectTheme={setManualTheme}
            theme={activeTheme}
          />
        )}

      </div>
    </>
  );
};

export default Weather;
