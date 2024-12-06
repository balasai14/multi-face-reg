import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Enable CORS for your frontend app (React in this case)
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", // Use .env for client origin
    credentials: true,
  })
);

// Middleware to parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Authentication routes
app.use("/api/auth", authRoutes);

// Serve models directory from 'frontend/public/models_recog' in both dev and production
// This allows face-api.js models to be accessed in both environments.
app.use("/models_recog", express.static(path.join(__dirname, "frontend", "public", "models")));

// In production, serve static files from the frontend's build directory
if (process.env.NODE_ENV === "production") {
  // Serve static files from the React production build directory
  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  // Catch-all for any route that isn’t an API request, to serve index.html (React SPA handling)
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
} else {
  // For development, serve static files from public directory (if not using React build)
  app.use(express.static(path.join(__dirname, "frontend", "public")));
}

// Start the server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port: ${PORT}`);
});