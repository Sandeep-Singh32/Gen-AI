// Demo script for Weather Prediction Agent
// This script demonstrates the functionality without requiring API keys

import { config } from "./config.js";

console.log("🌤️  Weather Prediction Agent Demo 🌤️\n");

// Demo data structure
const demoCurrentWeather = {
  city: "New York",
  country: "US",
  temperature: 18.5,
  feels_like: 17.2,
  humidity: 65,
  pressure: 1013,
  description: "partly cloudy",
  wind_speed: 12.3,
  visibility: 10000,
  sunrise: "6:45:23 AM",
  sunset: "7:30:45 PM"
};

const demoForecast = {
  city: "New York",
  country: "US",
  forecasts: [
    {
      date: "Mon Dec 16",
      avg_temp: "18.5",
      min_temp: "15.2",
      max_temp: "22.1",
      avg_humidity: 65,
      avg_wind_speed: "12.3",
      most_common_description: "partly cloudy"
    },
    {
      date: "Tue Dec 17",
      avg_temp: "16.8",
      min_temp: "12.4",
      max_temp: "20.3",
      avg_humidity: 72,
      avg_wind_speed: "15.7",
      most_common_description: "light rain"
    },
    {
      date: "Wed Dec 18",
      avg_temp: "14.2",
      min_temp: "8.9",
      max_temp: "18.6",
      avg_humidity: 78,
      avg_wind_speed: "18.2",
      most_common_description: "overcast"
    }
  ]
};

const demoAnalysis = {
  city: "New York",
  analysis: {
    temperature_trend: "decreasing",
    humidity_trend: "increasing",
    current_conditions: "partly cloudy",
    recommendations: [
      "Temperatures are dropping - dress in layers",
      "Increasing humidity - consider using air conditioning",
      "Light jacket recommended for evening"
    ]
  }
};

// Demo functions
function displayCurrentWeather(weather) {
  console.log("📍 Current Weather Demo:");
  console.log(`Location: ${weather.city}, ${weather.country}`);
  console.log(`Temperature: ${weather.temperature}°C (feels like ${weather.feels_like}°C)`);
  console.log(`Conditions: ${weather.description}`);
  console.log(`Humidity: ${weather.humidity}%`);
  console.log(`Wind Speed: ${weather.wind_speed} km/h`);
  console.log(`Visibility: ${weather.visibility / 1000} km`);
  console.log(`Sunrise: ${weather.sunrise}`);
  console.log(`Sunset: ${weather.sunset}`);
  console.log();
}

function displayForecast(forecast) {
  console.log("📅 Weather Forecast Demo:");
  console.log(`Location: ${forecast.city}, ${forecast.country}\n`);
  
  forecast.forecasts.forEach((day, index) => {
    console.log(`Day ${index + 1} (${day.date}):`);
    console.log(`  • Temperature: ${day.avg_temp}°C (min: ${day.min_temp}°C, max: ${day.max_temp}°C)`);
    console.log(`  • Humidity: ${day.avg_humidity}%`);
    console.log(`  • Wind: ${day.avg_wind_speed} km/h`);
    console.log(`  • Conditions: ${day.most_common_description}`);
    console.log();
  });
}

function displayAnalysis(analysis) {
  console.log("🔍 Weather Analysis Demo:");
  console.log(`Location: ${analysis.city}\n`);
  console.log(`Temperature Trend: ${analysis.analysis.temperature_trend}`);
  console.log(`Humidity Trend: ${analysis.analysis.humidity_trend}`);
  console.log(`Current Conditions: ${analysis.analysis.current_conditions}\n`);
  console.log("Recommendations:");
  analysis.analysis.recommendations.forEach(rec => {
    console.log(`  • ${rec}`);
  });
  console.log();
}

function displayConfiguration() {
  console.log("⚙️  Configuration Demo:");
  console.log(`Default Country: ${config.DEFAULT_COUNTRY}`);
  console.log(`Default Forecast Days: ${config.DEFAULT_FORECAST_DAYS}`);
  console.log(`Max Forecast Days: ${config.MAX_FORECAST_DAYS}`);
  console.log(`Units: ${config.UNITS}`);
  console.log(`Temperature Thresholds: Cold < ${config.TEMPERATURE_THRESHOLDS.COLD}°C, Hot > ${config.TEMPERATURE_THRESHOLDS.HOT}°C`);
  console.log(`Humidity Thresholds: Low < ${config.HUMIDITY_THRESHOLDS.LOW}%, High > ${config.HUMIDITY_THRESHOLDS.HIGH}%`);
  console.log(`Wind Thresholds: Moderate > ${config.WIND_THRESHOLDS.MODERATE} km/h, Strong > ${config.WIND_THRESHOLDS.STRONG} km/h`);
  console.log();
}

function displayUsageInstructions() {
  console.log("📖 Usage Instructions:");
  console.log("1. Set your API keys in config.js or as environment variables:");
  console.log("   - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey");
  console.log("   - OPENWEATHER_API_KEY: Get from https://openweathermap.org/api");
  console.log();
  console.log("2. Run the weather agent:");
  console.log("   npm start");
  console.log();
  console.log("3. Choose from the interactive menu:");
  console.log("   • Get current weather");
  console.log("   • Get weather forecast");
  console.log("   • Analyze weather patterns");
  console.log("   • Ask anything");
  console.log();
}

// Run demo
console.log("=".repeat(60));
displayConfiguration();
console.log("=".repeat(60));
displayCurrentWeather(demoCurrentWeather);
console.log("=".repeat(60));
displayForecast(demoForecast);
console.log("=".repeat(60));
displayAnalysis(demoAnalysis);
console.log("=".repeat(60));
displayUsageInstructions();
console.log("=".repeat(60));

console.log("🎉 Demo completed! Set up your API keys and run 'npm start' to use the real weather agent!"); 