// OpenWeatherMap API Key
const API_KEY = 'b6fd43b5e910a37e7cde6e1e9d8b8e6f';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Weather function
function weatherFn(cityName) {
	if (!cityName || cityName.trim() === '') {
		showError('Please enter a city name');
		return;
	}

	showLoading();
	hideError();
	clearWeatherInfo();

	// Fetch weather data
	fetch(`${API_URL}?q=${cityName}&appid=${API_KEY}&units=metric`)
		.then(response => {
			if (!response.ok) {
				throw new Error('City not found');
			}
			return response.json();
		})
		.then(data => {
			hideLoading();
			displayWeather(data);
		})
		.catch(error => {
			hideLoading();
			showError(error.message || 'Failed to fetch weather data');
			console.error('Error:', error);
		});
}

// Display weather information
function displayWeather(data) {
	// Format date
	const now = moment().format('dddd, MMMM DD, YYYY');

	// Get weather data
	const cityName = data.name + ', ' + data.sys.country;
	const temperature = Math.round(data.main.temp) + '°C';
	const description = data.weather[0].main;
	const windSpeed = 'Wind Speed: ' + (data.wind.speed * 3.6).toFixed(1) + ' km/h';
	const weatherIcon = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@4x.png';

	// Update HTML
	document.getElementById('city-name').textContent = cityName;
	document.getElementById('date').textContent = now;
	document.getElementById('temperature').textContent = temperature;
	document.getElementById('description').textContent = description;
	document.getElementById('wind-speed').textContent = windSpeed;
	document.getElementById('weather-icon').src = weatherIcon;
	document.getElementById('weather-icon').alt = description;

	// Show weather info
	document.getElementById('weather-info').classList.add('show');

	// Clear input
	document.getElementById('city-input').value = '';
}

// Show error message
function showError(message) {
	let errorDiv = document.getElementById('error-message');
	
	if (!errorDiv) {
		errorDiv = document.createElement('div');
		errorDiv.id = 'error-message';
		errorDiv.className = 'error-message';
		document.querySelector('.weather-card').insertBefore(errorDiv, document.getElementById('city-input'));
	}

	errorDiv.textContent = '❌ ' + message;
	errorDiv.classList.add('show');
}

// Hide error message
function hideError() {
	const errorDiv = document.getElementById('error-message');
	if (errorDiv) {
		errorDiv.classList.remove('show');
	}
}

// Show loading state
function showLoading() {
	let loadingDiv = document.getElementById('loading');
	
	if (!loadingDiv) {
		loadingDiv = document.createElement('div');
		loadingDiv.id = 'loading';
		loadingDiv.className = 'loading';
		loadingDiv.innerHTML = '<span></span><span></span><span></span>';
		document.getElementById('weather-info').parentNode.insertBefore(loadingDiv, document.getElementById('weather-info'));
	}

	loadingDiv.classList.add('show');
}

// Hide loading state
function hideLoading() {
	const loadingDiv = document.getElementById('loading');
	if (loadingDiv) {
		loadingDiv.classList.remove('show');
	}
}

// Clear weather info
function clearWeatherInfo() {
	document.getElementById('weather-info').classList.remove('show');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
	const cityInput = document.getElementById('city-input');
	const cityInputBtn = document.getElementById('city-input-btn');

	// Button click
	if (cityInputBtn) {
		cityInputBtn.addEventListener('click', function() {
			const cityName = cityInput.value;
			weatherFn(cityName);
		});
	}

	// Enter key press
	if (cityInput) {
		cityInput.addEventListener('keypress', function(event) {
			if (event.key === 'Enter') {
				const cityName = cityInput.value;
				weatherFn(cityName);
			}
		});
	}
});

// Console message
console.log('%c🌤️ GFG Weather App Loaded!', 'color: #28a745; font-size: 18px; font-weight: bold;');
console.log('%cEnter a city name to get the weather!', 'color: #666; font-size: 14px;');
