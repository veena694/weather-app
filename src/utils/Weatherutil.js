// Weather Codes Dictionary
const wCode = new Map();
wCode.set(0, "Clear Sky");
wCode.set(1, "Mainly Clear");
wCode.set(2, "Partly Cloudy");
wCode.set(3, "Overcast");
wCode.set(45, "Foggy");
wCode.set(48, "Depositing Rime Fog");
wCode.set(51, "Light Drizzle");
wCode.set(53, "Moderate Drizzle");
wCode.set(55, "Dense Drizzle");
wCode.set(56, "Light Freezing Drizzle");
wCode.set(57, "Dense Freezing Drizzle");
wCode.set(61, "Slight Rain");
wCode.set(63, "Moderate Rain");
wCode.set(65, "Heavy Rain");
wCode.set(66, "Light Freezing Rain");
wCode.set(67, "Heavy Freezing Rain");
wCode.set(71, "Slight Snow Fall");
wCode.set(73, "Moderate Snow Fall");
wCode.set(75, "Heavy Snow Fall");
wCode.set(77, "Snow Grains");
wCode.set(80, "Slight Rain Showers");
wCode.set(81, "Moderate Rain Showers");
wCode.set(82, "Violent Rain Showers");
wCode.set(85, "Slight Snow Showers");
wCode.set(86, "Heavy Snow Showers");
wCode.set(95, "Thunderstorm");
wCode.set(96, "Thunderstorm with Slight Hail");
wCode.set(99, "Thunderstorm with Heavy Hail");

// Temperature Conversions
const convetToFahrenheit = (celsiusTemp) => {
  return ((celsiusTemp * 9) / 5 + 32).toFixed(1);
};
const convertToFahrenheit = convetToFahrenheit;

const getWeatherType = (code) => {
  return wCode.get(code) || "Unknown Weather";
};

const getWeatherTypeCode = (code) => {
  return wCode.get(code) || "Unknown Weather";
};

// Premium Theme Profiles
// Premium Theme Profiles
const WEATHER_THEMES = {
  clear: {
    label: "Sunny",
    video: "https://player.vimeo.com/external/435674703.hd.mp4?s=6f4116190da21481b49fce5e34747eb83e6e8e81&profile_id=170",
    audio: "https://www.soundjay.com/ambient/sounds/ambient-pad-01.mp3",
    gradient: "from-sky-400 via-blue-500 to-cyan-300",
    overlay: "bg-yellow-200/10",
    glow: "shadow-cyan-500/30",
    accent: "#f59e0b",
    particleCount: 200,
    particleSpeed: 0.15,
    particleColor: "#facc15",
    particleType: "star",
    isLight: true,
  },
  cloudy: {
    label: "Cloudy",
    video: "https://player.vimeo.com/external/540092323.hd.mp4?s=d9403d73b2d9735d4d9b14d857f7564d28502d96&profile_id=174",
    audio: "https://www.soundjay.com/nature/sounds/wind-blowing-01.mp3",
    gradient: "from-slate-300 via-slate-400 to-zinc-500",
    overlay: "bg-slate-500/10",
    glow: "shadow-slate-500/30",
    accent: "#818cf8",
    particleCount: 500,
    particleSpeed: 0.3,
    particleColor: "#94a3b8",
    particleType: "fog",
    isLight: true,
  },
  rain: {
    label: "Rainy",
    video: "https://player.vimeo.com/external/424364402.hd.mp4?s=811f26a1b2413158c353ec2ab2fb95ee9ec31102&profile_id=170",
    audio: "https://www.soundjay.com/nature/sounds/rain-07.mp3",
    gradient: "from-slate-900 via-blue-900 to-gray-800",
    overlay: "bg-blue-500/10",
    glow: "shadow-blue-500/30",
    accent: "#06b6d4",
    particleCount: 2000,
    particleSpeed: 12.0,
    particleColor: "#60a5fa",
    particleType: "rain",
    isLight: false,
  },
  snow: {
    label: "Snowy",
    video: "https://player.vimeo.com/external/510850877.hd.mp4?s=d0032e3a1f81f18579decc2d427d14ca2e32a6e0&profile_id=170",
    audio: "https://www.soundjay.com/nature/sounds/wind-blowing-01.mp3",
    gradient: "from-cyan-100 via-sky-200 to-white",
    overlay: "bg-white/20",
    glow: "shadow-cyan-200/40",
    accent: "#22d3ee",
    particleCount: 800,
    particleSpeed: 1.5,
    particleColor: "#ffffff",
    particleType: "snow",
    isLight: true,
  },
  storm: {
    label: "Stormy",
    video: "https://player.vimeo.com/external/403204996.hd.mp4?s=548981df697669d671be18242a8b273ca356b69a&profile_id=170",
    audio: "https://www.soundjay.com/nature/sounds/thunder-2.mp3",
    gradient: "from-black via-purple-950 to-indigo-950",
    overlay: "bg-purple-500/10",
    glow: "shadow-purple-500/30",
    accent: "#a855f7",
    particleCount: 1500,
    particleSpeed: 15.0,
    particleColor: "#a855f7",
    particleType: "storm",
    isLight: false,
  },
  night: {
    label: "Night",
    video: "https://player.vimeo.com/external/370331493.hd.mp4?s=9e97c9b5d38a5a4cf6cb9f6479b1d5be5a242c74&profile_id=170",
    audio: "https://www.soundjay.com/ambient/sounds/ambient-pad-01.mp3",
    gradient: "from-[#020617] via-[#0f172a] to-[#1e293b]",
    overlay: "bg-indigo-500/10",
    glow: "shadow-indigo-500/30",
    accent: "#818cf8",
    particleCount: 400,
    particleSpeed: 0.05,
    particleColor: "#818cf8",
    particleType: "star",
    isLight: false,
  }
};

const getWeatherTheme = (code, isDay = true) => {
  if (code === undefined || code === null) {
    return isDay ? WEATHER_THEMES.clear : WEATHER_THEMES.night;
  }

  // Group weather codes into families
  if (code === 0 || code === 1) {
    return isDay ? WEATHER_THEMES.clear : WEATHER_THEMES.night;
  } else if (code === 2 || code === 3 || code === 45 || code === 48) {
    return WEATHER_THEMES.cloudy;
  } else if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82)
  ) {
    return WEATHER_THEMES.rain;
  } else if (
    (code >= 71 && code <= 77) ||
    (code >= 85 && code <= 86)
  ) {
    return WEATHER_THEMES.snow;
  } else if (code >= 95 && code <= 99) {
    return WEATHER_THEMES.storm;
  }

  return isDay ? WEATHER_THEMES.clear : WEATHER_THEMES.night;
};

// Dynamic AI Meteorological Synthesis Engine
const synthesizeAIInsights = (weatherData, isCelsius = true) => {
  if (!weatherData || !weatherData.current) return [];

  const { temp, code, wind, humidity, uv } = weatherData.current;
  const insights = [];

  const tempVal = parseFloat(temp);
  const displayTemp = isCelsius ? `${tempVal}°C` : `${convertToFahrenheit(tempVal)}°F`;

  // 1. Temperature Analysis
  if (tempVal > 35) {
    insights.push({
      type: "warning",
      title: "EXTREME TEMPERATURE HEURISTIC",
      text: `Critical heat spike of ${displayTemp} identified in the region. Active thermoregulation suggested: maintain standard rehydration of at least 3.5L of water and minimize physical expenditures during peak solar windows.`
    });
  } else if (tempVal > 25) {
    insights.push({
      type: "info",
      title: "WARM CLIMATE PROFILE",
      text: `Mildly elevated temperature registered at ${displayTemp}. Optimal conditions for outdoor atmospheric tracking. Protect visual systems with proper UV absorption lenses.`
    });
  } else if (tempVal < 5) {
    insights.push({
      type: "danger",
      title: "CRYOSPHERIC ADVISORY",
      text: `Substantial chill registered at ${displayTemp}. High risk of vasoconstriction. Ensure heavy thermal insulation overlays before entering ambient outdoor currents.`
    });
  } else {
    insights.push({
      type: "success",
      title: "THERMAL EQUILIBRIUM",
      text: `Temperate atmospheric reading of ${displayTemp}. Metabolic strain is negligible. Ideal climate parameters detected.`
    });
  }

  // 2. Weather Code Context
  const typeStr = getWeatherType(code).toUpperCase();
  if (code >= 95) {
    insights.push({
      type: "danger",
      title: "ELECTROMAGNETIC INSTABILITY",
      text: `Active ${typeStr} systems registered. Electrostatic discharges and violent microbursts possible. Terminate outdoor telemetry immediately; seek structure insulation.`
    });
  } else if (code >= 51 && code <= 82) {
    insights.push({
      type: "warning",
      title: "PRECIPITATION CONVECTION",
      text: `Active ${typeStr} active. Barometric drop corresponds to continuous vapor saturation. Secure outdoor equipment and expect high relative humidity factors.`
    });
  } else if (code === 45 || code === 48) {
    insights.push({
      type: "warning",
      title: "AEROSOL CONDENSATION DETECTED",
      text: `Dense ${typeStr} system active. Particulate light-scattering reduces visible ranges. Proceed with extreme navigational caution.`
    });
  }

  // 3. UV Index Analysis
  if (uv !== undefined && uv !== null) {
    const uvVal = parseFloat(uv);
    if (uvVal >= 8) {
      insights.push({
        type: "danger",
        title: "CRITICAL SOLAR FLUX",
        text: `Extreme UV index of ${uvVal} registered. DNA mutagenic risks elevated. Absolute requirement for broad-spectrum SPF 50+ blocks and protective outerwear.`
      });
    } else if (uvVal >= 5) {
      insights.push({
        type: "warning",
        title: "MODERATE ULTRAVIOLET CORONA",
        text: `UV index stands at ${uvVal}. Safe exposure window is restricted to under 30 minutes without protective skin barriers.`
      });
    }
  }

  // 4. Wind Speed Analysis
  if (wind !== undefined && wind !== null) {
    const windVal = parseFloat(wind);
    if (windVal > 40) {
      insights.push({
        type: "danger",
        title: "HIGH-VELOCITY KINETICS",
        text: `Gale currents shifting at ${windVal} km/h. Structural damage to light overhangs and loose objects imminent. Secure perimeter.`
      });
    } else if (windVal > 20) {
      insights.push({
        type: "info",
        title: "TURBULENT ATMOSPHERE",
        text: `Active wind gusts up to ${windVal} km/h. Air quality dispersion is elevated, reducing local pollen densities.`
      });
    }
  }

  // 5. Humidity Analysis
  if (humidity !== undefined && humidity !== null) {
    const humVal = parseFloat(humidity);
    if (humVal > 80) {
      insights.push({
        type: "warning",
        title: "VAPOR HYPERSATURATION",
        text: `Relative humidity stands high at ${humVal}%. Transpiration-based cooling efficiency is severely reduced. Stay in ventilated sectors.`
      });
    } else if (humVal < 25) {
      insights.push({
        type: "info",
        title: "XERIC ENVIRONMENT INDEX",
        text: `Dry air mass reading at ${humVal}%. Mucosal irritation possible. Hydrate nasal and dermal layers pro-actively.`
      });
    }
  }

  // Return top 3 synthesized insights to maintain visual elegance
  return insights.slice(0, 3);
};

export {
  convetToFahrenheit,
  convertToFahrenheit,
  getWeatherType,
  getWeatherTypeCode,
  getWeatherTheme,
  WEATHER_THEMES,
  WEATHER_THEMES as weatherThemes,
  synthesizeAIInsights
};