// script.js

// Allow "Enter" key to trigger search
function handleEnter(e) {
    if(e.key === 'Enter') getWeather();
}

async function getWeather() {
    const city = document.getElementById('city-input').value;
    const content = document.getElementById('weather-content');
    const loading = document.getElementById('loading');

    if (!city) return alert("Please enter a city name");

    // UI Reset
    content.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const response = await fetch(`weather.php?city=${city}`);
        const data = await response.json();

        loading.classList.add('hidden');

        if (!data.current || data.current.cod != 200) {
            alert(data.error || "City not found");
            return;
        }

        updateCurrentWeather(data.current);
        updateForecast(data.forecast);
        updateBackground(data.current.weather[0].main);
        
        content.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        loading.classList.add('hidden');
        alert("System Error. Check console.");
    }
}

function updateCurrentWeather(data) {
    document.getElementById('city-name').innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById('temp').innerText = Math.round(data.main.temp);
    document.getElementById('description').innerText = data.weather[0].description;
    document.getElementById('humidity').innerText = data.main.humidity;
    document.getElementById('wind').innerText = data.wind.speed;
    document.getElementById('pressure').innerText = data.main.pressure;
    document.getElementById('visibility').innerText = (data.visibility / 1000).toFixed(1);
    
    const iconCode = data.weather[0].icon;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}

function updateForecast(data) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = ""; // Clear previous

    // The API returns 40 items (5 days * 8 three-hour segments). 
    // Let's take the first 8 items for a 24-hour look ahead.
    const list = data.list.slice(0, 8); 

    list.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        
        const card = `
            <div class="forecast-card">
                <div>${time}</div>
                <img src="https://openweathermap.org/img/wn/${icon}.png" width="40">
                <div><strong>${temp}°C</strong></div>
            </div>
        `;
        container.innerHTML += card;
    });
}

function updateBackground(condition) {
    const body = document.body;
    let gradient = "";

    switch(condition.toLowerCase()) {
        case 'clear':
            gradient = "linear-gradient(135deg, #f5af19, #f12711)"; // Sunny/Orange
            break;
        case 'clouds':
            gradient = "linear-gradient(135deg, #bdc3c7, #2c3e50)"; // Cloudy/Grey
            break;
        case 'rain':
        case 'drizzle':
            gradient = "linear-gradient(135deg, #00416A, #E4E5E6)"; // Rainy/Blue-Grey
            break;
        case 'thunderstorm':
            gradient = "linear-gradient(135deg, #20002c, #cbb4d4)"; // Stormy/Dark Purple
            break;
        case 'snow':
            gradient = "linear-gradient(135deg, #E6DADA, #274046)"; // Snowy/White-Blue
            break;
        default:
            gradient = "linear-gradient(135deg, #74ebd5, #ACB6E5)"; // Default Blue/Green
    }
    
    body.style.background = gradient;
}