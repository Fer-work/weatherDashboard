import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.get("/api/status", (req, res) => {
  res.json({ message: "Server is ready!" });
});

app.listen(PORT, () => {
  console.log(`Weather Dashboard Server running on http://localhost:${PORT}`);
  console.log(`OpenWheather API key available: ${process.env.API_KEY}`);
});
