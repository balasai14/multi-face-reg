import * as faceapi from "face-api.js";
import path from "path";

// Flag to check if models are already loaded
let modelsLoaded = false;

/**
 * Function to load FaceAPI models from disk.
 */
export const loadFaceApiModels = async (req, res) => {
  if (modelsLoaded) {
    // If models are already loaded, skip loading again
    console.log("Models already loaded, skipping...");
    return res.status(200).json({ message: "Models already loaded." });
  }

  try {
    // Resolve model path
    const MODEL_URL = path.resolve(process.cwd(), "backend", "models_recog");
    console.log("Loading FaceAPI models from:", MODEL_URL);

    // Load the models
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);

    modelsLoaded = true; // Mark models as loaded
    console.log("FaceAPI models loaded successfully.");
    res.status(200).json({ message: "FaceAPI models loaded successfully." });
  } catch (error) {
    console.error("Error loading FaceAPI models:", error);
    res.status(500).json({ error: "Failed to load FaceAPI models." });
  }
};
