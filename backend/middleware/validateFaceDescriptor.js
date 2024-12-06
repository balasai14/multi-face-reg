import * as faceapi from "face-api.js";
import User from "../models/User.js"; // Adjust according to your model

export const validateFaceDescriptor = async (req, res, next) => {
  try {
    const { rollNumber, faceDescriptor } = req.body;

    if (!rollNumber || !faceDescriptor) {
      return res.status(400).json({ error: "Roll number and face descriptor are required." });
    }

    // Retrieve user from the database using rollNumber
    const user = await User.findOne({ rollNumber });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Compare the provided face descriptor with the stored one
    const storedFaceDescriptor = new Float32Array(user.faceDescriptor);

    // Compare descriptors using FaceAPI
    const match = faceapi.euclideanDistance(storedFaceDescriptor, faceDescriptor) < 0.6; // Threshold (you may need to adjust this value)

    if (!match) {
      return res.status(401).json({ error: "Face mismatch." });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Face descriptor validation failed." });
  }
};
