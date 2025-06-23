// File: client/JS/script.js

// We've removed the 'dotenv' import. That package is for Node.js (backend) and should not be in client-side code.
// The API key is now safely stored on the server.
import { iconBaseUrl, iconMap } from "./icons.js";

// --- DOM Element Selection ---
const inputCity = document.getElementById("inputCity");
const searchBtn = document.getElementById("searchBtn");
const cardContainer = document.getElementById("cardContainer");
// Note: querySelectorAll returns a NodeList, which is static. If you add cards dynamically, you'd need to re-query.
// For this app, it's fine since the cards are pre-defined in the HTML.
const cardElements = document.querySelectorAll(".card");
const resultsContainer = document.querySelector(".resultsContainer");

// We no longer need global 'lat' and 'lon' variables, as the server handles all of that.

// --- State Management ---
// Load search history from localStorage. This remains unchanged.
let cityHistory = JSON.parse(window.localStorage.getItem("cityHistory")) || [];

// --- Core Functions ---

/**
 * REFACTORED: This is the main function that now fetches weather data from OUR OWN backend.
 */
function searchForCity() {
  const city = inputCity.value.trim(); // .trim() is good practice to remove whitespace.
  if (!city) {
    alert("Please enter a city name."); // Simple validation.
    return;
  }

  // This is the key change! We now fetch from our own server's endpoint.
  // The server will then securely call the OpenWeatherMap API for us.
  // The frontend no longer knows or needs the API key.
  // We're using port 3001, which is where our Express server is running.
  fetch(`http://localhost:3001/api/weather/${city}`)
    .then((response) => {
      // It's good practice to check if the response was successful (status code in the 200-299 range).
      // If not, we can handle the error from the server.
      if (!response.ok) {
        // The server will send back an error object (e.g., { error: "City not found" })
        // We throw an error here to jump to the .catch() block.
        return response.json().then((err) => {
          throw new Error(err.error || "Something went wrong");
        });
      }
      return response.json();
    })
    .then((data) => {
      // The data structure received from our server is the same as the original OpenWeatherMap data.
      // So, the rest of the logic can remain very similar.

      // We filter the data to get one forecast per day.
      const filteredData = data.list
        .filter((item, index, arr) => {
          const date = item.dt_txt.substring(0, 10);
          // This logic ensures we only take the first entry for each new day.
          return index === 0 || date !== arr[index - 1].dt_txt.substring(0, 10);
        })
        .map((item) => ({ ...item, city: data.city })); // Add city info to each forecast item.

      // Now we can update our UI and history with the processed data.
      updateHistory(filteredData);
      updateCards(filteredData);
    })
    .catch((error) => {
      // This will catch errors from the fetch call itself (e.g., network error)
      // or the error we threw from a bad response (e.g., 404 City not found).
      console.error("Error fetching weather:", error);
      alert(`Could not fetch weather data: ${error.message}`);
    });
}

/**
 * Updates the weather cards on the screen with new forecast data.
 * This function's internal logic remains the same as it just renders data.
 * @param {Array} filteredData - An array of forecast objects for the upcoming days.
 */
function updateCards(filteredData) {
  // We need to update the main card and the 5-day forecast cards.
  // Let's combine the main card with the other cards for easier processing.
  const allCards = [document.querySelector(".todayWeather"), ...cardElements];

  allCards.forEach((card, index) => {
    // Check if there's data for this card. API sometimes returns less than 6 days.
    if (!filteredData[index] || !card) return;

    const forecast = filteredData[index];
    const date = new Date(forecast.dt_txt).toLocaleDateString();
    const iconCode = forecast.weather[0].icon;
    const iconUrl = `${iconBaseUrl}${iconMap[iconCode]}`;

    // Use more specific selectors to avoid conflicts with shared IDs.
    const cardDate = card.querySelector(".date");
    const weatherSymbol = card.querySelector(".weatherSymbol"); // Use class selector
    const degrees = card.querySelector(".cardDegrees"); // Use class selector
    const cardWind = card.querySelector(".cardWind"); // Use class selector
    const cardHumidity = card.querySelector(".cardHumidity"); // Use class selector
    const cityNameEl = document.querySelector("#cityName"); // Main city name is separate

    // Update the main display's city name only for the first card.
    if (index === 0 && cityNameEl) {
      cityNameEl.textContent = `${forecast.city.name}:`;
    }

    if (cardDate) cardDate.textContent = date;
    if (weatherSymbol) weatherSymbol.src = iconUrl;
    console.debug(iconUrl);
    if (degrees) degrees.innerHTML = `Temp: ${forecast.main.temp} &#176;F`;
    if (cardWind) cardWind.innerHTML = `Wind: ${forecast.wind.speed} MPH`;
    if (cardHumidity)
      cardHumidity.innerHTML = `Humidity: ${forecast.main.humidity} %`;
  });
}

/**
 * Updates the search history in localStorage and adds a new button to the sidebar.
 * This function's internal logic is mostly the same.
 * @param {Array} filteredData - The processed forecast data, used to get the city name and save details.
 */
function updateHistory(filteredData) {
  const apiCityName = filteredData[0].city.name;

  // Check if the city is already in our history to avoid duplicates.
  const isAlreadyInHistory = cityHistory.some(
    (city) => city.name === apiCityName
  );
  if (isAlreadyInHistory) {
    console.log("City is already in history.");
    return; // Don't add it again.
  }

  const newCity = {
    name: apiCityName,
    items: [],
  };

  // The 5-day forecast + today's weather
  const forecastDays = filteredData.slice(0, 6);

  forecastDays.forEach((forecast) => {
    newCity.items.push({
      date: new Date(forecast.dt_txt).toLocaleDateString(),
      icon: `${iconBaseUrl}${iconMap[forecast.weather[0].icon]}`,
      temp: forecast.main.temp,
      wind: forecast.wind.speed,
      humidity: forecast.main.humidity,
    });
  });

  // Add the new city to our history array and save to localStorage.
  cityHistory.push(newCity);
  localStorage.setItem("cityHistory", JSON.stringify(cityHistory));

  // Update the UI to show the new city in the search history.
  addCityButtonToSidebar(apiCityName);
}

/**
 * Renders the initial list of city buttons from localStorage on page load.
 */
function displaySearchHistory() {
  resultsContainer.innerHTML = ""; // Clear existing buttons first.
  cityHistory.forEach((city) => {
    addCityButtonToSidebar(city.name);
  });
}

/**
 * Creates and appends a single city button to the sidebar.
 * @param {string} cityName - The name of the city to display on the button.
 */
function addCityButtonToSidebar(cityName) {
  const newSearch = document.createElement("button");
  newSearch.className =
    "city w-full my-1 bg-gray-500 rounded-2xl text-white font-medium p-2 hover:bg-gray-600";
  newSearch.textContent = cityName;
  // We add the event listener right here when the button is created.
  newSearch.addEventListener("click", handleHistoryClick);
  resultsContainer.appendChild(newSearch);
}

/**
 * Handles clicks on the search history buttons.
 * @param {Event} event - The click event object.
 */
function handleHistoryClick(event) {
  const cityName = event.target.textContent;
  const cityData = cityHistory.find((city) => city.name === cityName);

  if (cityData) {
    // To re-use the updateCards function, we need to format the stored data
    // to look like the API response.
    const formattedData = cityData.items.map((item) => ({
      dt_txt: new Date(item.date).toISOString(), // A mock date string
      weather: [{ icon: item.icon.split("/").pop().replace(".png", "") }], // Extract icon code
      main: {
        temp: item.temp,
        humidity: item.humidity,
      },
      wind: { speed: item.wind },
      city: { name: cityData.name },
    }));
    updateCards(formattedData);
  }
}

// --- Event Listeners & Initializations ---

// When the search button is clicked, call our main search function.
searchBtn.addEventListener("click", searchForCity);

// Allow pressing Enter in the input field to trigger a search
inputCity.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    searchForCity();
  }
});

// On page load, display the stored search history.
displaySearchHistory();
