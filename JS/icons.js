let weatherSymbol = document.getElementById("weatherSymbol-1");

const apiKey = "8379f224a8238289aa94fd39c3277518";
const city = "Los Angeles";

const iconBaseUrl = "http://openweathermap.org/img/wn/";

const iconMap = {
  "01d": "01d.png",
  "02d": "02d.png",
  "03d": "03d.png",
  "04d": "04d.png",
  "09d": "09d.png",
  "10d": "10d.png",
  "11d": "11d.png",
  "13d": "13d.png",
  "50d": "50d.png",
  "01n": "01n.png",
  "02n": "02n.png",
  "03n": "03n.png",
  "04n": "04n.png",
  "09n": "09n.png",
  "10n": "10n.png",
  "11n": "11n.png",
  "13n": "13n.png",
  "50n": "50n.png",
};

fetch(
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
)
  .then((response) => response.json())
  .then((data) => {
    const iconCode = data.weather[0].icon;
    const iconUrl = `${iconBaseUrl}${iconMap[iconCode]}`;
    weatherSymbol.src = iconUrl;
  });
