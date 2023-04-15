let inputCity = document.getElementById("inputCity");
let searchBtn = document.getElementById("searchBtn");
const cardContainer = document.getElementById("cardContainer");
const cardElements = document.querySelectorAll(".card");
console.log(cardElements);

let lat;
let lon;

/* 
<div class="card overflow-hidden bg-gray-500 text-white shadow sm:rounded-lg">
  <div class="px-4 py-1 sm:px-6">
    <h3 class="date text-base font-semibold leading-6 py-1">date 2</h3>
    <img id="weatherSymbol" class="mt-1 max-w-2xl text-3xl pb-2">
    </img>
    <p id="cardDegrees">
      Temp: <span>68 degrees F</span>
    </p>
    <p id="cardWind">
      wind: <span>3.5 MPH</span>
    </p>
    <p id="cardHumidity">
      humidity: <span>63%</span>
    </p>
  </div>
</div>; 
*/
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

// function createCards(filteredData) {
//   for (let i = 1; i < filteredData.length; i++) {
//     const date = new Date(filteredData[i].dt_txt).toLocaleDateString();
//     const iconCode = filteredData[i].weather[0].icon;
//     const iconUrl = `${iconBaseUrl}${iconMap[iconCode]}`;

//     // create the html elements

//     // create the parent div
//     const parentDiv = document.createElement("div");
//     parentDiv.innerHTML = "";
//     parentDiv.className =
//       "card overflow-hidden bg-indigo-500 text-white shadow sm:rounded-lg";
//     // an inner div for centering and padding
//     const secondDiv = document.createElement("div");
//     secondDiv.className = "px-4 py-1 sm:px-6";
//     // the date displayed on the card
//     const cardDate = document.createElement("h3");
//     cardDate.className = "date text-base font-semibold leading-6 py-1";
//     cardDate.textContent = date;
//     // The weather symbol to be displayed on the card
//     const weatherSymbol = document.createElement("img");
//     weatherSymbol.className = "mt-1 max-w-2xl text-3xl pb-2";
//     weatherSymbol.src = iconUrl;
//     // the degrees to be displayed
//     const degrees = document.createElement("p");
//     degrees.innerHTML = `Temp: ${filteredData[i].main.temp} &#176;F`;
//     // the wind speed to be displayed
//     const cardWind = document.createElement("p");
//     cardWind.innerHTML = `Wind: ${filteredData[i].wind.speed} MPH`;
//     // the humidity to be displayed
//     const cardHumidity = document.createElement("p");
//     cardHumidity.innerHTML = `Humidity: ${filteredData[i].main.humidity} %`;

//     secondDiv.appendChild(cardDate);
//     secondDiv.appendChild(weatherSymbol);
//     secondDiv.appendChild(degrees);
//     secondDiv.appendChild(cardWind);
//     secondDiv.appendChild(cardHumidity);

//     console.log(secondDiv);
//     parentDiv.appendChild(secondDiv);
//     console.log(parentDiv);

//     cardContainer.appendChild(parentDiv);

//     // const weatherSymbol = card.querySelector(".weatherSymbol");
//     // const cardDegrees = card.querySelector(".cardDegrees span");
//     // const cardWind = card.querySelector(".cardWind span");
//     // const cardHumidity = card.querySelector(".cardHumidity span");

//     console.log(filteredData);
//     // console.log(weatherSymbol);

//     // weatherSymbol.innerHTML = `<i class="uil uil-${data.weather[0].icon}"></i>`;
//     // cardDegrees.textContent = `Temp: ${data.main.temp} degrees F`;
//     // cardWind.textContent = `wind: ${data.wind.speed} MPH`;
//     // cardHumidity.textContent = `humidity: ${data.main.humidity}%`;
//     // card.querySelector(".date").textContent = date;
//   }
// }

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
      console.log(filteredData);
      // console.log(data);
      // updateHistory();
      updateCards(filteredData);
    });
}
//  function to update the html with weather data
// function updateHistory() {}

// add event listener to search button
searchBtn.addEventListener("click", getCoordinates);
