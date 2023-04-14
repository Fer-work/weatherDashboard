let inputCity = document.getElementById("inputCity");
let searchBtn = document.getElementById("searchBtn");

let lat;
let lon;

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
      getWeatherApi();
    });
}

function getWeatherApi() {
  //   let requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

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
      updateHistory();
    });
}
//  function to update the html with weather data
function updateHistory() {}

// add event listener to search button
searchBtn.addEventListener("click", getCoordinates);
