// Configuration file for Weather Prediction Agent
// Copy this file to config.local.js and add your actual API keys

export const config = {
  // Google Gemini API Key
  // Get your key from: https://makersuite.google.com/app/apikey
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY",
  
  // OpenWeatherMap API Key
  // Get your key from: https://openweathermap.org/api
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || "YOUR_OPENWEATHER_API_KEY",
  
  // Default settings
  DEFAULT_COUNTRY: "US",
  DEFAULT_FORECAST_DAYS: 5,
  MAX_FORECAST_DAYS: 7,
  
  // API endpoints
  OPENWEATHER_BASE_URL: "https://api.openweathermap.org/data/2.5",
  UNITS: "metric", // metric, imperial, kelvin
  
  // Temperature thresholds for recommendations
  TEMPERATURE_THRESHOLDS: {
    COLD: 10,      // Below this temperature is considered cold
    HOT: 25,       // Above this temperature is considered hot
    FREEZING: 0    // Below this temperature is considered freezing
  },
  
  // Humidity thresholds
  HUMIDITY_THRESHOLDS: {
    HIGH: 80,      // Above this humidity is considered high
    LOW: 30        // Below this humidity is considered low
  },
  
  // Wind speed thresholds (km/h)
  WIND_THRESHOLDS: {
    STRONG: 20,    // Above this wind speed is considered strong
    MODERATE: 10   // Above this wind speed is considered moderate
  }
};

// Helper function to validate configuration
export function validateConfig() {
  const errors = [];
  
  if (config.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
    errors.push("GEMINI_API_KEY is not set. Please add your Google Gemini API key.");
  }
  
  if (config.OPENWEATHER_API_KEY === "YOUR_OPENWEATHER_API_KEY") {
    errors.push("OPENWEATHER_API_KEY is not set. Please add your OpenWeatherMap API key.");
  }
  
  return errors;
}

// Helper function to get API keys with environment variable support
export function getApiKeys() {
  return {
    gemini: config.GEMINI_API_KEY,
    openweather: config.OPENWEATHER_API_KEY
  };
} 