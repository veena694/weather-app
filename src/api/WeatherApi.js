import Axios from "axios";

const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

const convertDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate();
  return `${year}-${month}-${day}`;
};

/**
 * Fetch detailed weather telemetry for specified coordinates.
 */
const getWeather = async ({ latitude, longitude }) => {
  const currentDate = new Date();
  const startDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  
  const { data: weatherInfo } = await Axios.get(WEATHER_API_URL, {
    params: {
      latitude,
      longitude,
      current_weather: true,
      timezone: "IST",
      
      // Daily forecast metrics (standard compat)
      daily: [
        "temperature_2m_max", 
        "temperature_2m_min", 
        "weather_code",
        "uv_index_max",
        "sunrise",
        "sunset",
        "wind_speed_10m_max"
      ],
      
      // Hourly spline metrics (24H timeline)
      hourly: [
        "temperature_2m",
        "weather_code",
        "relative_humidity_2m"
      ],
      
      start_date: convertDate(startDate),
      end_date: convertDate(new Date(startDate.setDate(startDate.getDate() + 7))),
    }
  });
  
  return weatherInfo;
};

/**
 * Resolve typed text queries into geographic coordinates using free Open-Meteo Geocoding.
 */
const searchCity = async (query) => {
  if (!query || query.trim().length < 2) return [];
  
  try {
    const { data } = await Axios.get(GEOCODING_API_URL, {
      params: {
        name: query,
        count: 5,
        language: "en",
        format: "json"
      }
    });
    return data.results || [];
  } catch (error) {
    console.error("Geocoding failed:", error);
    return [];
  }
};

export default getWeather;
export { searchCity };