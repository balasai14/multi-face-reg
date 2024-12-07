import bcryptjs from "bcryptjs";
import * as faceapi from "face-api.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import path from 'path';

// Flag to check if models are already loaded
let modelsLoaded = false;

// Function to load FaceAPI models
export const loadFaceApiModels = async (req, res) => {
  if (modelsLoaded) {
    console.log("Models already loaded, skipping...");
    return res.status(200).json({ message: "Models already loaded." });
  }

  try {
    const MODEL_URL = path.resolve(process.cwd(), "backend", "models_recog");
    console.log("Loading FaceAPI models from:", MODEL_URL);

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);

    modelsLoaded = true;
    console.log("FaceAPI models loaded successfully.");
    return res.status(200).json({ message: "FaceAPI models loaded successfully." });
  } catch (error) {
    console.error("Error loading FaceAPI models:", error);
    return res.status(500).json({ error: "Failed to load FaceAPI models." });
  }
};

// Backend: Assuming descriptor is sent as an array (not a Float32Array)
export const validateFaceDescriptor = (req, res, next) => {
  let { faceDescriptor } = req.body;

  if (!faceDescriptor) {
    return res.status(400).json({
      error: "Face descriptor is missing in the request body.",
    });
  }

  let parsedFaceDescriptor;
  if (typeof faceDescriptor === "string") {
    try {
      parsedFaceDescriptor = JSON.parse(faceDescriptor);
    } catch (err) {
      return res.status(400).json({
        error: "Face descriptor must be valid JSON.",
      });
    }
  } else {
    parsedFaceDescriptor = faceDescriptor;
  }

  if (
    !Array.isArray(parsedFaceDescriptor) ||
    parsedFaceDescriptor.length !== 128 ||
    parsedFaceDescriptor.some(
      (num) => typeof num !== "number" || num < -1 || num > 1
    )
  ) {
    return res.status(400).json({
      error: "Face descriptor must be an array of 128 numbers between -1 and 1.",
      received: parsedFaceDescriptor,
    });
  }

  req.body.faceDescriptor = parsedFaceDescriptor;
  next();
};

// Signup function
export const signup = async (req, res) => {
  try {
    const { rollNumber, name, faceDescriptor } = req.body;

    if (!rollNumber || !name || !faceDescriptor) {
      return res.status(400).json({
        error: "Please provide roll number, name, and face descriptor.",
      });
    }

    const existingUser = await User.findOne({ rollNumber });
    if (existingUser) {
      return res.status(400).json({ error: "Roll number already exists." });
    }

    const newUser = new User({
      rollNumber,
      name,
      faceDescriptor,
    });

    await newUser.save();
    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ error: "Signup failed. Please try again later." });
  }
};

// Login function
export const login = async (req, res) => {
	try {
	  const { rollNumber, faceDescriptor } = req.body;
  
	  if (!rollNumber || !faceDescriptor) {
		return res.status(400).json({
		  error: "Please provide roll number and face descriptor.",
		});
	  }
  
	  const user = await User.findOne({ rollNumber });
	  if (!user) {
		return res.status(404).json({ error: "User not found." });
	  }
  
	  // Ensure the 'name' field exists on the user object
	  if (!user.name) {
		return res.status(500).json({ error: "User name is missing." });
	  }
  
	  const storedDescriptor = user.faceDescriptor;
	  const distance = faceapi.euclideanDistance(faceDescriptor, storedDescriptor);
  
	  if (distance > 0.6) {
		return res.status(401).json({ error: "Face recognition failed." });
	  }
  
	  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
	  return res.status(200).json({
      message: "Login successful.",
      token,
      user: { name: user.name, rollNumber: user.rollNumber, isVerified: true },
    });
    
	} catch (error) {
	  console.error("Login error:", error);
	  return res.status(500).json({ error: "Login failed. Please try again later." });
	}
  };
  
  
// Logout function
export const logout = (req, res) => {
  try {
    res.clearCookie("auth_token");
    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed." });
  }
};

// Authorization check
export const checkAuth = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return res.status(200).json({ success: true, userId: decoded.userId });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
};
