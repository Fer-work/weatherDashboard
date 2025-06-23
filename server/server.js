import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Import weather app router.
import weatherRoutes from "./routes/weatherRoutes.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware Setup ---
// Enable Cross-Origin Resource Sharing so our frontend (on a different port) can communicate with this server.
app.use(cors());
// Enable the express app to parse JSON formatted request bodies.
app.use(express.json());

// --- API Routes ---
// This is the main entry point for our API.
// Any request starting with '/api/weather' will be handed off to our 'weatherRoutes' router.
app.use("/api/weather", weatherRoutes);

// A simple status route to check if the server is running.
app.get("/api/status", (req, res) => {
  res.json({ message: "Server is ready!" });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Weather Dashboard Server running on http://localhost:${PORT}`);
  // A safer check to confirm the API key is loaded without logging the key itself.
  console.log(
    `OpenWeather API key available: ${process.env.API_KEY ? "Yes" : "No"}`
  );
});
