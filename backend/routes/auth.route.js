import express from 'express';
import { login, signup } from '../controllers/auth.controller.js';
import { loadFaceApiModels } from '../controllers/auth.controller.js';  // Correct import path

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Use this route to load the FaceAPI models
app.get('/load-models', loadFaceApiModels);

// Create a router for signup and login
const router = express.Router();

// Signup and Login Routes
router.post("/signup", signup);
router.post("/login", login);

// Use the router for the routes
app.use(router);

// Export the router as the default export
export default app;  // This makes 'auth.route.js' the default export
