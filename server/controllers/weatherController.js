// server/controllers/weatherController.js
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.API_KEY;

/**
 * Controller function to get weather data for a specific city.
 * It's an async function because we'll be using await for our fetch calls,
 * which makes the code much cleaner than using multiple .then() chains.
 * @param {object} req - The Express request object. It contains information about the incoming request, like parameters.
 * @param {object} res - The Express response object. We use this to send a response back to the client.
 */
export const getWeatherByCity = async (req, res) => {
  // We get the city name from the URL parameters (e.g., /api/weather/london -> req.params.city will be "london")
  const city = req.params.city;
  // Debugging
  // console.log("City: ", city);

  // Basic validation to ensure a city was provided.
  if (!city) {
    return res.status(400).json({ error: "City parameter is required" });
  }

  // A try...catch block is essential for handling potential errors during the API calls.
  // If anything inside the 'try' block fails, the 'catch' block will execute.
  try {
    // --- Step 1: Get Geographical Coordinates for the City ---
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    // --- NEW: Better Logging & Error Handling ---
    // Let's log the actual response from the API. This is key for debugging!
    // console.log("Response from Geo API:", geoData);

    // This is a more robust check. It looks at the HTTP status code.
    // If the status is 401, 404, etc., `ok` will be false.
    if (!geoResponse.ok) {
      // We'll grab the error message from the API response and send it to our client.
      const errorMessage = geoData.message || "Could not fetch geo data.";
      // We use the status from the API response to give a more accurate error code.
      return res.status(geoResponse.status).json({ error: errorMessage });
    }

    // Handle the case where the API call was successful (status 200) but no city was found.
    if (geoData.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }
    // --- END of NEW section ---

    // Destructure the latitude and longitude from the response.
    const { lat, lon } = geoData[0];

    // --- Step 2: Get the 5-Day Weather Forecast using the Coordinates ---
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    // --- Step 3: Send the Final Data to the Client ---
    res.status(200).json(weatherData);
  } catch (error) {
    // This will give us a much more detailed error in the Vercel logs
    console.error("[getWeatherByCity] CRITICAL ERROR:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch weather data. Please try again later." });
  }
};

/**
 * NEW: Controller function to get weather data for a given set of coordinates.
 * @param {object} req - The Express request object. Expects 'lat' and 'lon' in the query string.
 * @param {object} res - The Express response object.
 */
export const getWeatherByCoords = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude query parameters are required" });
  }

  try {
    // This is simpler than the city search because we already have the coordinates.
    // We can call the forecast API directly.
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    // Handle potential errors from the OpenWeatherMap API
    if (!weatherResponse.ok) {
      const errorMessage =
        weatherData.message || "Could not fetch weather data for coordinates.";
      return res.status(weatherResponse.status).json({ error: errorMessage });
    }

    // Send the final data back to the client
    res.status(200).json(weatherData);
  } catch (error) {
    console.error("Internal Server Error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch weather data. Please try again later." });
  }
};
