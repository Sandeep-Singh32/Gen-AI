# 🌤️ Weather Prediction Agent

An intelligent AI-powered weather prediction agent that uses Google Gemini AI and OpenWeatherMap API to provide current weather conditions, forecasts, and weather analysis with personalized recommendations.

## ✨ Features

- **Current Weather**: Get real-time weather conditions for any city worldwide
- **Weather Forecast**: Get detailed 5-day weather forecasts with temperature ranges
- **Weather Analysis**: Analyze weather patterns and trends with AI-powered insights
- **Smart Recommendations**: Receive personalized recommendations based on weather conditions
- **Interactive Interface**: User-friendly command-line interface with guided prompts
- **Multi-city Support**: Check weather for cities across different countries

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- API keys for Google Gemini and OpenWeatherMap

### Installation

1. **Clone or navigate to the weather-agent directory:**
   ```bash
   cd weather-agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Get API Keys:**
   - **Google Gemini API**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get your API key
   - **OpenWeatherMap API**: Visit [OpenWeatherMap](https://openweathermap.org/api) to get your free API key

4. **Configure API Keys:**
   Open `index.js` and replace the placeholder values:
   ```javascript
   const GEMINI_API_KEY = "your_gemini_api_key_here";
   const OPENWEATHER_API_KEY = "your_openweather_api_key_here";
   ```

5. **Run the agent:**
   ```bash
   npm start
   ```

## 🎯 Usage

The Weather Prediction Agent provides an interactive menu with four main options:

### 1. Get Current Weather
- Enter a city name
- Get real-time weather data including:
  - Temperature (current and feels like)
  - Humidity and pressure
  - Wind speed and visibility
  - Weather description
  - Sunrise and sunset times

### 2. Get Weather Forecast
- Enter a city name and number of days (1-7)
- Receive detailed daily forecasts with:
  - Average, minimum, and maximum temperatures
  - Average humidity and wind speed
  - Most common weather condition for each day

### 3. Analyze Weather Patterns
- Enter a city name
- Get AI-powered analysis including:
  - Temperature and humidity trends
  - Current conditions summary
  - Personalized recommendations

### 4. Ask Anything
- Ask any weather-related question in natural language
- The AI will understand and provide relevant information

## 📊 Example Output

### Current Weather
```
🌤️  Current Weather in New York 🌤️

Location: New York, US
Temperature: 18.5°C (feels like 17.2°C)
Conditions: Partly cloudy
Humidity: 65%
Wind Speed: 12.3 km/h
Visibility: 10 km
Sunrise: 6:45:23 AM
Sunset: 7:30:45 PM

Recommendations:
• Weather conditions are pleasant
• Light jacket recommended for evening
```

### Weather Forecast
```
🌤️  5-Day Forecast for London 🌤️

Day 1 (Mon Dec 16):
• Temperature: 8.2°C (min: 5.1°C, max: 11.3°C)
• Humidity: 78%
• Wind: 15.2 km/h
• Conditions: Light rain

Day 2 (Tue Dec 17):
• Temperature: 7.8°C (min: 4.2°C, max: 10.5°C)
• Humidity: 82%
• Wind: 18.7 km/h
• Conditions: Overcast

...
```

### Weather Analysis
```
🔍 Weather Analysis for Tokyo 🔍

Temperature Trend: Increasing
Humidity Trend: Stable
Current Conditions: Clear sky

Recommendations:
• Temperatures are rising - dress in layers
• Low humidity - stay hydrated
• Clear skies - great for outdoor activities
```

## 🛠️ Technical Details

### Dependencies
- `@google/genai`: Google Gemini AI integration
- `@inquirer/prompts`: Interactive command-line prompts
- `axios`: HTTP client for API requests

### API Integration
- **OpenWeatherMap API**: Provides current weather and forecast data
- **Google Gemini AI**: Powers natural language understanding and responses

### Functions
- `getCurrentWeather()`: Fetches real-time weather data
- `getWeatherForecast()`: Retrieves multi-day forecasts
- `analyzeWeatherPatterns()`: Performs trend analysis and generates recommendations

## 🔧 Customization

You can easily customize the agent by:

1. **Adding new weather functions** in the `functionType` object
2. **Modifying recommendations** in the `generateRecommendations()` function
3. **Changing the system prompt** to adjust AI behavior
4. **Adding new API integrations** for additional weather data sources

## 🌍 Supported Features

- **Global Coverage**: Works with cities worldwide
- **Multiple Languages**: Supports city names in various languages
- **Unit Conversion**: All temperatures in Celsius, wind speeds in km/h
- **Error Handling**: Graceful handling of API errors and invalid inputs
- **Conversation Memory**: Maintains context across multiple interactions

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure both API keys are correctly set in `index.js`
2. **City Not Found**: Try using the English name of the city
3. **Network Issues**: Check your internet connection
4. **Rate Limiting**: OpenWeatherMap has rate limits for free accounts

### Error Messages
- `Failed to get weather for [city]`: Check city name spelling or API key
- `Failed to get forecast for [city]`: Verify API key and city name
- `Failed to analyze weather patterns`: Usually indicates API connectivity issues

## 📝 License

This project is open source and available under the ISC License.

## 🤝 Contributing

Feel free to contribute by:
- Adding new weather data sources
- Improving the recommendation engine
- Enhancing the user interface
- Adding new analysis features

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Verify your API keys are correct
3. Ensure all dependencies are installed
4. Check the console for detailed error messages

---

**Happy Weather Forecasting! 🌈☀️🌧️❄️** 