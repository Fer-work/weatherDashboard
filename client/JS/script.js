// client/JS/script.js

import { iconBaseUrl, iconMap, defaultIcon } from "./icons.js";

// --- DOM Element Selection ---
const inputCity = document.getElementById("inputCity");
const searchBtn = document.getElementById("searchBtn");
const cardContainer = document.getElementById("cardContainer");
// Note: querySelectorAll returns a NodeList, which is static. If you add cards dynamically, you'd need to re-query.
// For this app, it's fine since the cards are pre-defined in the HTML.
const cardElements = document.querySelectorAll(".card");
const resultsContainer = document.querySelector(".resultsContainer");

// --- State Management ---
// Load search history from localStorage. This remains unchanged.
let cityHistory = JSON.parse(window.localStorage.getItem("cityHistory")) || [];

// --- Core Functions ---

/**
 * NEW: Sets a default state for the UI on page load.
 */
function initializeUI() {
  // Find all image elements meant for weather symbols
  const allWeatherSymbols = document.querySelectorAll(".weatherSymbol");
  // Set their source to the default icon
  allWeatherSymbols.forEach((img) => {
    img.src = `${iconBaseUrl}${defaultIcon}`;
  });
}

/**
 * NEW: Fetches weather data from our backend using latitude and longitude.
 * @param {number} lat - The latitude.
 * @param {number} lon - The longitude.
 */
function fetchWeatherByCoords(lat, lon) {
  // Call our new backend endpoint with the coordinate as query parameters
  fetch(`/api/weather/coords?lat=${lat}&lon=${lon}`)
    .then(async (response) => {
      // Debugging
      // console.log(response);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Something went wront");
      }
      return response.json();
    })
    .then((data) => {
      // We have the weather data, now process and display it
      const filteredData = data.list
        .filter((item, index, arr) => {
          const date = item.dt_txt.substring(0, 10);
          return index === 0 || date !== arr[index - 1].dt_txt.substring(0, 10);
        })
        .map((item) => ({ ...item, city: data.city }));

      // Debugging
      // console.log("Filtered Data: ", filteredData);

      // The API response from coordinates gives us a city name we can use for the history
      const currentCityName = data.city.name;
      updateHistory(filteredData, currentCityName);
      updateCards(filteredData, currentCityName);
    })
    .catch((error) => {
      console.error("Error fetching weather by coordinates: ", error);
      alert(`Could not fetch weather for your location: ${error.message}`);
    });
}

/**
 * NEW: Asks the user for their location and fetches weather data if permission is granted.
 */
function getWeatherForCurrentLocation() {
  // Check if the browser supports the Geolocation API
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      // Success Callback: This runs if the user clicks "Allow"
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherByCoords(lat, lon);
      },
      // Error Callback: This runs if the user clicks "Block" or an error occurs
      (error) => {
        console.error("Geolocation error:", error);
        // We don't show an alert here, as the user may have intentionally denied permission.
        // The app will just wait for them to search manually.
      }
    );
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

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
  fetch(`/api/weather/${city}`)
    .then(async (response) => {
      // It's good practice to check if the response was successful (status code in the 200-299 range).
      // If not, we can handle the error from the server.
      if (!response.ok) {
        // The server will send back an error object (e.g., { error: "City not found" })
        // We throw an error here to jump to the .catch() block.
        const err = await response.json();
        throw new Error(err.error || "Something went wrong");
      }
      return response.json();
    })
    .then((data) => {
      // The data structure received from our server is the same as the original OpenWeatherMap data.
      // So, the rest of the logic can remain very similar.

      const unfilteredData = data.list;

      // We filter the data to get one forecast per day.
      const filteredData = unfilteredData
        .filter((item, index, arr) => {
          const date = item.dt_txt.substring(0, 10);
          // This logic ensures we only take the first entry for each new day.
          return index === 0 || date !== arr[index - 1].dt_txt.substring(0, 10);
        })
        .map((item) => ({ ...item, city: data.city })); // Add city info to each forecast item.

      // Debugging
      // console.log(city);
      // Now we can update our UI and history with the processed data.
      updateHistory(filteredData, city);
      updateCards(filteredData, city);
    })
    .catch((error) => {
      // This will catch errors from the fetch call itself (e.g., network error)
      // or the error we threw from a bad response (e.g., 404 City not found).
      console.error("Error fetching weather:", error);
      alert(`Could not fetch weather data: ${error.message}`);
    });
}

/**
 * Creates and updates the weather cards on the screen with new forecast data.
 * @param {Array} filteredData - An array of forecast objects for the upcoming days.
 */
function updateCards(filteredData, searchedCity) {
  // Get references to the static "Today" card and the container for the 5-day forecast
  const todayCard = document.querySelector(".todayWeather");
  const forecastContainer = document.getElementById("cardContainer");

  // Always clear the old forecast cards before adding new ones
  forecastContainer.innerHTML = "";

  // Handle the Today card separately, as it already exists in the HTML
  const todayData = filteredData[0];

  // Debugging
  // console.log(`todayData outside if: `, todayData);
  // console.log(`searchedCity outside if: ${searchedCity}`);
  const cityToDisplay = searchedCity || todayData.city.name;

  if (cityToDisplay) {
    // Debugging
    // console.log(`cityToDisplay: ${cityToDisplay}`);

    const displayCity =
      cityToDisplay.charAt(0).toUpperCase() + cityToDisplay.slice(1) ||
      todayCard.city;

    // Debugging
    // console.log(`displayCity: `, displayCity);

    document.querySelector("#cityName").textContent = `${displayCity}:`;
    todayCard.querySelector(".date").textContent = new Date(
      todayData.dt_txt
    ).toLocaleDateString();
    todayCard.querySelector(".weatherSymbol").src = `${iconBaseUrl}${
      iconMap[todayData.weather[0].icon]
    }`;
    todayCard.querySelector(
      ".cardDegrees"
    ).innerHTML = `Temp: ${todayData.main.temp} &#176;F`;
    todayCard.querySelector(
      ".cardWind"
    ).innerHTML = `Wind: ${todayData.wind.speed} MPH`;
    todayCard.querySelector(
      ".cardHumidity"
    ).innerHTML = `Humidity: ${todayData.main.humidity} %`;
  }

  // Get the data for the next 5 days by skipping the first item (today)
  const forecastData = filteredData.slice(1);

  // Loop through the 5-day forecast data to create cards dynamically
  forecastData.forEach((forecast) => {
    // 1. Create the main parent div for the card
    const card = document.createElement("div");
    card.className =
      "card overflow-hidden bg-indigo-500 text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 sm:rounded-lg flex-1 m-2 p-4";

    // 2. Create all the inner elements (date, icon, temp, etc.)
    const dateEl = document.createElement("h3");
    dateEl.className = "date text-base font-semibold leading-6 py-1";
    dateEl.textContent = new Date(forecast.dt_txt).toLocaleDateString();

    const iconEl = document.createElement("img");
    iconEl.className = "weatherSymbol mt-1 max-w-2xl text-3xl pb-2";
    iconEl.src = `${iconBaseUrl}${iconMap[forecast.weather[0].icon]}`;

    const tempEl = document.createElement("p");
    tempEl.className = "cardDegrees";
    tempEl.innerHTML = `Temp: ${forecast.main.temp} &#176;F`;

    // CORRECTED: Use .className to assign classes
    const windEl = document.createElement("p");
    windEl.className = "cardWind";
    windEl.innerHTML = `Wind: ${forecast.wind.speed} MPH`;

    // CORRECTED: Use .className to assign classes
    const humidityEl = document.createElement("p");
    humidityEl.className = "cardHumidity";
    humidityEl.innerHTML = `Humidity: ${forecast.main.humidity} %`;

    // 3. Append the inner elements to the card div in the correct order
    card.appendChild(dateEl);
    card.appendChild(iconEl);
    card.appendChild(tempEl);
    card.appendChild(windEl);
    card.appendChild(humidityEl);

    // 4. Append the fully constructed card to the main forecast container
    forecastContainer.appendChild(card);
  });
}

/**
 * Updates the search history in localStorage and adds a new button to the sidebar.
 * This function's internal logic is mostly the same.
 * @param {Array} filteredData - The processed forecast data, used to get the city name and save details.
 */
function updateHistory(filteredData, searchedCity) {
  const apiCityName =
    searchedCity.charAt(0).toUpperCase() + searchedCity.slice(1).toLowerCase();

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
  // For Debugging
  // console.log(`Api city name: ${apiCityName}`);

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
    updateCards(formattedData, cityName);
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

// NEW: Set the default icons for the initial UI state
initializeUI();
// On page load, display the stored search history.
displaySearchHistory();
// NEW: Call the function to get the user's location when the page loads
getWeatherForCurrentLocation();
