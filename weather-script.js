// OpenWeatherMap API Key
// Note: Get your free API key from https://openweathermap.org/api
const API_KEY = 'b6fd43b5e910a37e7cde6e1e9d8b8e6f'; // Free API key for demo
const API_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorText = document.getElementById('error-text');
const currentWeatherEl = document.getElementById('current-weather');
const forecastSection = document.getElementById('forecast-section');
const hourlySection = document.getElementById('hourly-section');

// Hide elements
function hideAll() {
  loadingEl.style.display = 'none';
  errorEl.style.display = 'none';
  currentWeatherEl.style.display = 'none';
  forecastSection.style.display = 'none';
  hourlySection.style.display = 'none';
}

// Show error
function showError(message) {
  hideAll();
  errorText.textContent = message;
  errorEl.style.display = 'block';
}

// Show loading
function showLoading() {
  hideAll();
  loadingEl.style.display = 'block';
}

// Format temperature
function formatTemp(temp) {
  return Math.round(temp);
}

// Format wind speed (m/s to km/h)
function formatWindSpeed(speed) {
  return (speed * 3.6).toFixed(1);
}

// Format visibility (m to km)
function formatVisibility(visibility) {
  return (visibility / 1000).toFixed(1);
}

// Get weather icon URL
function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}

// Format date
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Format time
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Format date and time
function formatDateTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Fetch current weather
async function fetchCurrentWeather(lat, lon) {
  try {
    const url = `${API_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Weather data not found');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

// Fetch forecast
async function fetchForecast(lat, lon) {
  try {
    const url = `${API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Forecast data not found');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}

// Fetch One Call API (includes UV index)
async function fetchOneCall(lat, lon) {
  try {
    const url = `${API_URL}/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('One Call data not found');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching One Call data:', error);
    return null;
  }
}

// Display current weather
function displayCurrentWeather(weather, oneCall) {
  hideAll();
  
  document.getElementById('city-name').textContent = 
    `${weather.name}, ${weather.sys.country}`;
  
  document.getElementById('date-time').textContent = 
    formatDateTime(weather.dt);
  
  document.getElementById('weather-icon-large').src = 
    getWeatherIconUrl(weather.weather[0].icon);
  
  document.getElementById('temperature').textContent = 
    formatTemp(weather.main.temp);
  
  document.getElementById('weather-desc').textContent = 
    weather.weather[0].description;
  
  document.getElementById('feels-like-temp').textContent = 
    formatTemp(weather.main.feels_like);
  
  document.getElementById('humidity').textContent = 
    `${weather.main.humidity}%`;
  
  document.getElementById('wind-speed').textContent = 
    `${formatWindSpeed(weather.wind.speed)} km/h`;
  
  document.getElementById('pressure').textContent = 
    `${weather.main.pressure} hPa`;
  
  document.getElementById('visibility').textContent = 
    `${formatVisibility(weather.visibility)} km`;
  
  document.getElementById('clouds').textContent = 
    `${weather.clouds.all}%`;
  
  const uvIndex = oneCall ? formatTemp(oneCall.current.uvi) : 'N/A';
  document.getElementById('uv-index').textContent = uvIndex;
  
  currentWeatherEl.style.display = 'block';
}

// Display 5-day forecast
function displayForecast(forecastData) {
  const forecastGrid = document.getElementById('forecast-grid');
  forecastGrid.innerHTML = '';
  
  // Group forecast by day (take one per day at noon)
  const forecastByDay = {};
  
  forecastData.list.forEach(item => {
    const date = formatDate(item.dt);
    const hour = new Date(item.dt * 1000).getHours();
    
    // Store item closest to noon
    if (!forecastByDay[date] || Math.abs(hour - 12) < Math.abs(
      new Date(forecastByDay[date].dt * 1000).getHours() - 12
    )) {
      forecastByDay[date] = item;
    }
  });
  
  // Create forecast cards (limit to 5 days)
  Object.values(forecastByDay).slice(0, 5).forEach(item => {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    
    card.innerHTML = `
      <div class="date">${formatDate(item.dt)}</div>
      <img src="${getWeatherIconUrl(item.weather[0].icon)}" alt="Weather">
      <div style="font-size: 14px; margin: 5px 0;">${item.weather[0].main}</div>
      <div class="temp-range">
        <span class="max">${formatTemp(item.main.temp_max)}°</span> / 
        <span class="min">${formatTemp(item.main.temp_min)}°</span>
      </div>
      <div style="font-size: 12px; opacity: 0.7;">💧 ${item.main.humidity}%</div>
    `;
    
    forecastGrid.appendChild(card);
  });
  
  forecastSection.style.display = 'block';
}

// Display hourly forecast
function displayHourlyForecast(forecastData) {
  const hourlyScroll = document.getElementById('hourly-scroll');
  hourlyScroll.innerHTML = '';
  
  // Show next 24 hours (8 items * 3 hours)
  forecastData.list.slice(0, 8).forEach(item => {
    const card = document.createElement('div');
    card.className = 'hourly-card';
    
    card.innerHTML = `
      <div class="time">${formatTime(item.dt)}</div>
      <img src="${getWeatherIconUrl(item.weather[0].icon)}" alt="Weather">
      <div class="temp">${formatTemp(item.main.temp)}°C</div>
      <div style="font-size: 12px; opacity: 0.7;">💧 ${item.main.humidity}%</div>
    `;
    
    hourlyScroll.appendChild(card);
  });
  
  hourlySection.style.display = 'block';
}

// Get coordinates by city name
async function getCoordinatesByCity(cityName) {
  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('City not found');
    
    const data = await response.json();
    if (data.length === 0) throw new Error('City not found');
    
    return { lat: data[0].lat, lon: data[0].lon };
  } catch (error) {
    console.error('Error getting coordinates:', error);
    throw error;
  }
}

// Search weather by city
async function searchWeather() {
  const city = cityInput.value.trim();
  
  if (!city) {
    showError('Please enter a city name');
    return;
  }
  
  showLoading();
  
  try {
    const coords = await getCoordinatesByCity(city);
    await fetchAndDisplayWeather(coords.lat, coords.lon);
  } catch (error) {
    showError(`Error: ${error.message || 'Unable to fetch weather data'}`);
  }
}

// Get current location
function getCurrentLocation() {
  showLoading();
  
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        await fetchAndDisplayWeather(latitude, longitude);
      } catch (error) {
        showError(`Error: ${error.message || 'Unable to fetch weather data'}`);
      }
    },
    (error) => {
      showError(`Geolocation error: ${error.message}`);
    }
  );
}

// Fetch and display weather data
async function fetchAndDisplayWeather(lat, lon) {
  try {
    showLoading();
    
    const [weather, forecast, oneCall] = await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchForecast(lat, lon),
      fetchOneCall(lat, lon)
    ]);
    
    displayCurrentWeather(weather, oneCall);
    displayForecast(forecast);
    displayHourlyForecast(forecast);
    
  } catch (error) {
    showError(`Error: ${error.message || 'Unable to fetch weather data'}`);
  }
}

// Enter key to search
cityInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    searchWeather();
  }
});

// Load default location on page load
window.addEventListener('DOMContentLoaded', function() {
  // Try to get current location, fallback to London
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await fetchAndDisplayWeather(latitude, longitude);
        } catch (error) {
          console.error('Error:', error);
        }
      },
      () => {
        // Fallback to London
        fetchAndDisplayWeather(51.5074, -0.1278);
      }
    );
  } else {
    // Fallback to London
    fetchAndDisplayWeather(51.5074, -0.1278);
  }
});