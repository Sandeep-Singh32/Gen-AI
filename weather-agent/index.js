import { input, select } from "@inquirer/prompts";
import { GoogleGenAI, Type } from "@google/genai";
import axios from "axios";
import { config, validateConfig, getApiKeys } from "./config.js";

// Validate configuration
const errors = validateConfig();
if (errors.length > 0) {
  console.log("⚠️  Configuration errors:");
  errors.forEach(error => console.log(`   - ${error}`));
  console.log("\nPlease set your API keys in the config.js file or as environment variables.");
  process.exit(1);
}

const { gemini: GEMINI_API_KEY, openweather: OPENWEATHER_API_KEY } = getApiKeys();
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Function to get current weather
async function getCurrentWeather({ city, country = config.DEFAULT_COUNTRY }) {
  try {
    const response = await axios.get(
      `${config.OPENWEATHER_BASE_URL}/weather?q=${city},${country}&appid=${OPENWEATHER_API_KEY}&units=${config.UNITS}`
    );
    
    const weather = response.data;
    return {
      city: weather.name,
      country: weather.sys.country,
      temperature: weather.main.temp,
      feels_like: weather.main.feels_like,
      humidity: weather.main.humidity,
      pressure: weather.main.pressure,
      description: weather.weather[0].description,
      wind_speed: weather.wind.speed,
      visibility: weather.visibility,
      sunrise: new Date(weather.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(weather.sys.sunset * 1000).toLocaleTimeString()
    };
  } catch (error) {
    return { error: `Failed to get weather for ${city}: ${error.message}` };
  }
}

// Function to get weather forecast
async function getWeatherForecast({ city, country = config.DEFAULT_COUNTRY, days = config.DEFAULT_FORECAST_DAYS }) {
  try {
    const response = await axios.get(
      `${config.OPENWEATHER_BASE_URL}/forecast?q=${city},${country}&appid=${OPENWEATHER_API_KEY}&units=${config.UNITS}`
    );
    
    const forecasts = response.data.list;
    const dailyForecasts = [];
    
    // Group forecasts by day
    const dailyData = {};
    forecasts.forEach(forecast => {
      const date = new Date(forecast.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          temps: [],
          descriptions: [],
          humidity: [],
          wind_speed: []
        };
      }
      dailyData[date].temps.push(forecast.main.temp);
      dailyData[date].descriptions.push(forecast.weather[0].description);
      dailyData[date].humidity.push(forecast.main.humidity);
      dailyData[date].wind_speed.push(forecast.wind.speed);
    });
    
    // Calculate daily averages
    Object.keys(dailyData).slice(0, days).forEach(date => {
      const data = dailyData[date];
      dailyForecasts.push({
        date: date,
        avg_temp: (data.temps.reduce((a, b) => a + b, 0) / data.temps.length).toFixed(1),
        min_temp: Math.min(...data.temps).toFixed(1),
        max_temp: Math.max(...data.temps).toFixed(1),
        avg_humidity: Math.round(data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length),
        avg_wind_speed: (data.wind_speed.reduce((a, b) => a + b, 0) / data.wind_speed.length).toFixed(1),
        most_common_description: getMostCommon(data.descriptions)
      });
    });
    
    return {
      city: response.data.city.name,
      country: response.data.city.country,
      forecasts: dailyForecasts
    };
  } catch (error) {
    return { error: `Failed to get forecast for ${city}: ${error.message}` };
  }
}

// Function to analyze weather patterns
async function analyzeWeatherPatterns({ city, country = config.DEFAULT_COUNTRY }) {
  try {
    // Get current weather and forecast
    const currentWeather = await getCurrentWeather({ city, country });
    const forecast = await getWeatherForecast({ city, country, days: config.MAX_FORECAST_DAYS });
    
    if (currentWeather.error || forecast.error) {
      return { error: "Failed to get weather data for analysis" };
    }
    
    // Analyze temperature trends
    const temps = [currentWeather.temperature, ...forecast.forecasts.map(f => parseFloat(f.avg_temp))];
    const tempTrend = analyzeTrend(temps);
    
    // Analyze humidity patterns
    const humidity = [currentWeather.humidity, ...forecast.forecasts.map(f => f.avg_humidity)];
    const humidityTrend = analyzeTrend(humidity);
    
    return {
      city: currentWeather.city,
      analysis: {
        temperature_trend: tempTrend,
        humidity_trend: humidityTrend,
        current_conditions: currentWeather.description,
        recommendations: generateRecommendations(currentWeather, forecast.forecasts[0])
      }
    };
  } catch (error) {
    return { error: `Failed to analyze weather patterns: ${error.message}` };
  }
}

// Helper function to get most common item in array
function getMostCommon(arr) {
  const counts = {};
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

// Helper function to analyze trend
function analyzeTrend(values) {
  if (values.length < 2) return "insufficient data";
  
  const firstHalf = values.slice(0, Math.ceil(values.length / 2));
  const secondHalf = values.slice(Math.ceil(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  
  if (Math.abs(diff) < 2) return "stable";
  return diff > 0 ? "increasing" : "decreasing";
}

// Helper function to generate recommendations
function generateRecommendations(current, forecast) {
  const recommendations = [];
  
  if (current.temperature < config.TEMPERATURE_THRESHOLDS.COLD) {
    recommendations.push("Wear warm clothing");
  } else if (current.temperature > config.TEMPERATURE_THRESHOLDS.HOT) {
    recommendations.push("Stay hydrated and avoid prolonged sun exposure");
  }
  
  if (current.temperature < config.TEMPERATURE_THRESHOLDS.FREEZING) {
    recommendations.push("Freezing temperatures - wear heavy winter clothing");
  }
  
  if (current.humidity > config.HUMIDITY_THRESHOLDS.HIGH) {
    recommendations.push("High humidity - consider using air conditioning");
  } else if (current.humidity < config.HUMIDITY_THRESHOLDS.LOW) {
    recommendations.push("Low humidity - stay hydrated and use moisturizer");
  }
  
  if (current.wind_speed > config.WIND_THRESHOLDS.STRONG) {
    recommendations.push("Strong winds - secure loose objects");
  } else if (current.wind_speed > config.WIND_THRESHOLDS.MODERATE) {
    recommendations.push("Moderate winds - light jacket recommended");
  }
  
  if (current.description.includes("rain")) {
    recommendations.push("Bring an umbrella or raincoat");
  }
  
  if (current.description.includes("snow")) {
    recommendations.push("Dress warmly and be careful of icy conditions");
  }
  
  if (current.description.includes("storm") || current.description.includes("thunder")) {
    recommendations.push("Storm conditions - stay indoors if possible");
  }
  
  return recommendations.length > 0 ? recommendations : ["Weather conditions are pleasant"];
}

// Function declarations for Gemini
const currentWeatherDeclaration = {
  name: "getCurrentWeather",
  description: "Gets the current weather conditions for a specific city.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      city: {
        type: Type.STRING,
        description: "The name of the city to get weather for (e.g., 'New York', 'London', 'Tokyo')",
      },
      country: {
        type: Type.STRING,
        description: "The country code (e.g., 'US', 'GB', 'JP'). Defaults to 'US' if not specified.",
      },
    },
    required: ["city"],
  },
};

const forecastDeclaration = {
  name: "getWeatherForecast",
  description: "Gets weather forecast for a specific city for the next few days.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      city: {
        type: Type.STRING,
        description: "The name of the city to get forecast for (e.g., 'New York', 'London', 'Tokyo')",
      },
      country: {
        type: Type.STRING,
        description: "The country code (e.g., 'US', 'GB', 'JP'). Defaults to 'US' if not specified.",
      },
      days: {
        type: Type.NUMBER,
        description: "Number of days to forecast (1-7). Defaults to 5 if not specified.",
      },
    },
    required: ["city"],
  },
};

const analysisDeclaration = {
  name: "analyzeWeatherPatterns",
  description: "Analyzes weather patterns and provides recommendations for a specific city.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      city: {
        type: Type.STRING,
        description: "The name of the city to analyze weather patterns for (e.g., 'New York', 'London', 'Tokyo')",
      },
      country: {
        type: Type.STRING,
        description: "The country code (e.g., 'US', 'GB', 'JP'). Defaults to 'US' if not specified.",
      },
    },
    required: ["city"],
  },
};

const functionType = {
  getCurrentWeather: getCurrentWeather,
  getWeatherForecast: getWeatherForecast,
  analyzeWeatherPatterns: analyzeWeatherPatterns,
};

const history = [];

const weatherAgent = async (message) => {
  history.push({ role: "user", parts: [{ text: message }] });

  while (true) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: history,
      config: {
        systemInstruction: `You are a helpful Weather Prediction AI Assistant. You can help users with:
        1. Getting current weather conditions for any city
        2. Getting weather forecasts for upcoming days
        3. Analyzing weather patterns and providing recommendations
        
        When users ask about current weather, call the getCurrentWeather function.
        When users ask about weather forecasts or predictions, call the getWeatherForecast function.
        When users ask for weather analysis or recommendations, call the analyzeWeatherPatterns function.
        
        Always provide helpful, friendly responses and explain the weather data in an easy-to-understand way.
        Include relevant recommendations based on the weather conditions.`,
        tools: [
          {
            functionDeclarations: [
              currentWeatherDeclaration,
              forecastDeclaration,
              analysisDeclaration,
            ],
          },
        ],
      },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const { name, args } = response.functionCalls[0];
      console.log("Fetching weather data...", { name, args });

      const func = functionType[name];
      const result = await func(args);

      // Send the function response back to the model
      history.push({
        role: "model",
        parts: [
          {
            functionCall: response.functionCalls[0],
          },
        ],
      });

      // Store the function response in contents
      const functionResponse = {
        name,
        response: {
          result,
        },
      };

      history.push({
        role: "user",
        parts: [
          {
            functionResponse: functionResponse,
          },
        ],
      });
    } else {
      const result = response.text;
      history.push({
        role: "model",
        parts: [{ text: result }],
      });
      console.log("\n" + result + "\n");
      break;
    }
  }
};

const main = async () => {
  console.log("🌤️  Welcome to the Weather Prediction Agent! 🌤️\n");
  
  const action = await select({
    message: "What would you like to do?",
    choices: [
      {
        name: "Get current weather",
        value: "current",
        description: "Get current weather conditions for a city"
      },
      {
        name: "Get weather forecast",
        value: "forecast",
        description: "Get weather forecast for upcoming days"
      },
      {
        name: "Analyze weather patterns",
        value: "analyze",
        description: "Get weather analysis and recommendations"
      },
      {
        name: "Ask anything",
        value: "custom",
        description: "Ask any weather-related question"
      }
    ]
  });

  let message = "";
  
  switch (action) {
    case "current":
      const city = await input({ message: "Enter city name:" });
      message = `What's the current weather in ${city}?`;
      break;
    case "forecast":
      const forecastCity = await input({ message: "Enter city name:" });
      const days = await input({ message: "How many days? (1-7):", default: "5" });
      message = `What's the weather forecast for ${forecastCity} for the next ${days} days?`;
      break;
    case "analyze":
      const analyzeCity = await input({ message: "Enter city name:" });
      message = `Can you analyze the weather patterns for ${analyzeCity} and provide recommendations?`;
      break;
    case "custom":
      message = await input({ message: "Ask me anything about weather:" });
      break;
  }

  await weatherAgent(message);
  
  const continueChat = await select({
    message: "Would you like to ask another question?",
    choices: [
      { name: "Yes", value: true },
      { name: "No", value: false }
    ]
  });

  if (continueChat) {
    console.log("\n" + "=".repeat(50) + "\n");
    main();
  } else {
    console.log("\n👋 Thanks for using the Weather Prediction Agent! Stay weather-wise! 🌈");
  }
};

// Configuration is already validated at the top of the file

main().catch(console.error); 