import dotenv from "dotenv";
import { iconBaseUrl, iconMap } from "./icons.js";
dotenv.config();

const apiKey = dotenv.API_KEY;

let inputCity = document.getElementById("inputCity");
let searchBtn = document.getElementById("searchBtn");
const cardContainer = document.getElementById("cardContainer");
const cardElements = document.querySelectorAll(".card");

const resultsContainer = document.querySelector(".resultsContainer");

let lat;
let lon;

// search history object array
let cityHistory = JSON.parse(window.localStorage.getItem("cityHistory")) || [];
// get all of the cards to update their information
function updateCards(filteredData) {
  cardElements.forEach((card, index) => {
    const date = new Date(filteredData[index].dt_txt).toLocaleDateString();
    const iconCode = filteredData[index].weather[0].icon;
    const iconUrl = `${iconBaseUrl}${iconMap[iconCode]}`;
    const cardDate = card.querySelector(".date");
    const weatherSymbol = card.querySelector("#weatherSymbol");
    const degrees = card.querySelector("#cardDegrees");
    const cardWind = card.querySelector("#cardWind");
    const cardHumidity = card.querySelector("#cardHumidity");
    const cityName = card.querySelector("#cityName");

    if (cityName !== null) {
      cityName.textContent = `${filteredData[index].city.name}:`;
    }

    cardDate.textContent = date;
    weatherSymbol.src = iconUrl;
    degrees.innerHTML = `Temp: ${filteredData[index].main.temp} &#176;F`;
    cardWind.innerHTML = `Wind: ${filteredData[index].wind.speed} MPH`;
    cardHumidity.innerHTML = `Humidity: ${filteredData[index].main.humidity} %`;
  });
}

function getCoordinates() {
  let city = inputCity.value;
  let coordinates = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

  fetch(coordinates)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      lat = data[0].lat;
      lon = data[0].lon;
      getCityInfo();
    });
}

function getCityInfo() {
  //   let requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const filteredData = data.list
        .filter((item, index, arr) => {
          const date = item.dt_txt.substring(0, 10); // extract date portion
          return index === 0 || date !== arr[index - 1].dt_txt.substring(0, 10); // compare only dates
        })
        .map((item) => ({ ...item, city: data.city })); // add city property to each item in filteredData
      updateHistory(filteredData);
      updateCards(filteredData);
    });
}

// DONE: data is correctly saved in local storage.
function updateHistory(filteredData) {
  const apiCityName = filteredData[0].city.name;
  var newCity = {
    name: apiCityName,
    items: [],
  };
  for (let index = 0; index < filteredData.length; index++) {
    const dateVar = new Date(filteredData[index].dt_txt).toLocaleDateString();
    const iconCode = filteredData[index].weather[0].icon;
    const iconUrl = `${iconBaseUrl}${iconMap[iconCode]}`;
    const temperature = filteredData[index].main.temp;
    const windSpeed = filteredData[index].wind.speed;
    const humidPercent = filteredData[index].main.humidity;

    newCity.items.push({
      date: dateVar,
      icon: iconUrl,
      temp: temperature,
      wind: windSpeed,
      humidity: humidPercent,
    });
  }

  if (cityHistory.length > 0) {
    for (let i = 0; i < cityHistory.length; i++) {
      if (cityHistory[i].name === filteredData[0].city.name) {
        alert("this city is already in local storage");
        return;
      }
    }

    // Add the new city to the array if it's not already in it
    cityHistory.push(newCity);
    localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
    updateSidebar(filteredData[0].city.name);
  } else {
    cityHistory.push(newCity);
    localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
  }
}

// TODO: get the city names from local storage and show them on the sidebar where the history appears
function displaySearchHistory() {
  for (let i = 0; i < cityHistory.length; i++) {
    const newSearch = document.createElement("button");
    newSearch.className = "city w-full my-1 bg-gray-500 rounded-2xl";
    newSearch.innerHTML = cityHistory[i].name;

    resultsContainer.appendChild(newSearch);
  }
}

function updateSidebar(newCity) {
  const newSearch = document.createElement("button");
  newSearch.className = "city w-full my-1 bg-gray-500 rounded-2xl";
  newSearch.innerHTML = newCity;

  resultsContainer.appendChild(newSearch);
}

// add event listener to search button
searchBtn.addEventListener("click", getCoordinates);
displaySearchHistory();

let buttons = document.querySelectorAll(".city");

buttons.forEach((button) => {
  button.addEventListener("click", (event) => {
    element = event.target;

    for (let i = 0; i < cityHistory.length; i++) {
      if (element.textContent == cityHistory[i].name) {
        cardElements.forEach((card, index) => {
          const dateVar = cityHistory[i].items[index].date;
          const iconUrl = cityHistory[i].items[index].icon;
          const temperature = cityHistory[i].items[index].temp;
          const windSpeed = cityHistory[i].items[index].wind;
          const humidPercent = cityHistory[i].items[index].humidity;

          const cardDate = card.querySelector(".date");
          const weatherSymbol = card.querySelector("#weatherSymbol");
          const degrees = card.querySelector("#cardDegrees");
          const cardWind = card.querySelector("#cardWind");
          const cardHumidity = card.querySelector("#cardHumidity");
          const cityName = card.querySelector("#cityName");

          if (cityName !== null) {
            cityName.textContent = `${cityHistory[i].name}:`;
          }

          cardDate.textContent = dateVar;
          weatherSymbol.src = iconUrl;
          degrees.innerHTML = `Temp: ${temperature} &#176;F`;
          cardWind.innerHTML = `Wind: ${windSpeed} MPH`;
          cardHumidity.innerHTML = `Humidity: ${humidPercent} %`;
        });
      }
    }
  });
});
