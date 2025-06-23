import { Router } from "express";
import { getWeatherByCity } from "../controllers/weatherController.js";

// Create a new router instance. A router is like a mini-app, capable of having its own middleware and routes.
const router = Router();

// Define the route.
// When a GET request is made to '/:city' (relative to where this router is mounted in server.js),
// the 'getWeatherByCity' controller function will be executed.
// For example, if this router is mounted at '/api/weather', this route will handle '/api/weather/london'.
router.get("/:city", getWeatherByCity);

// Export the router so it can be used in the main server.js file.
export default router;
