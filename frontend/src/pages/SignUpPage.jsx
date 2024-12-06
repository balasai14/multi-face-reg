import { motion } from "framer-motion";
import Input from "../components/Input";
import Webcam from "react-webcam";
import { User, Clipboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import * as faceapi from "face-api.js";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [image, setImage] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [formError, setFormError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // Load FaceAPI models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models"; // Adjust based on your public folder path
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setIsModelLoaded(true);
      } catch (err) {
        alert("Failed to load face recognition models.");
      }
    };
    loadModels();
  }, []);

  const handleCapture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setImageError("No image captured. Please try again.");
      return;
    }

    const img = document.createElement("img");
    img.src = imageSrc;

    img.onload = async () => {
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection || !detection.descriptor) {
        setImageError("No face detected. Ensure your face is visible.");
        return;
      }

      // Only set the faceDescriptor if detection is successful
      setFaceDescriptor(Array.from(detection.descriptor)); // Convert Float32Array to a plain array
      setImage(imageSrc);
      setImageError(null); // Clear any previous error
    };
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Ensure all required fields are filled
    if (!name.trim() || !rollNumber.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }

    // Ensure face descriptor is captured
    if (!faceDescriptor) {
      setFormError("Face descriptor is missing. Please capture a face image.");
      return;
    }

    const payload = {
      name,
      rollNumber,
      faceDescriptor, // Send the descriptor array
    };

    try {
      // Sending POST request to backend
      const response = await axios.post("http://localhost:5000/api/auth/signup", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201) {
        navigate("/login"); // Redirect to login on successful signup
      }
    } catch (error) {
      setFormError(error.response?.data?.error || "Signup failed.");
    }
  };

  return (
    <motion.div className="max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-400">Create Account</h2>
      <form onSubmit={handleSignup}>
        <Input
          icon={User}
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          icon={Clipboard}
          type="text"
          placeholder="Roll Number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
        />
        <div className="mt-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-lg"
          />
          <button
            type="button"
            onClick={handleCapture}
            className="mt-2 w-full bg-gray-700 py-2 text-white rounded-lg"
            disabled={!isModelLoaded} // Disable button until model is loaded
          >
            Capture Image
          </button>
          {imageError && <p className="text-red-500 mt-2">{imageError}</p>}
        </div>
        {image && <img src={image} alt="Captured" className="mt-4 rounded-lg" />}
        {formError && <p className="text-red-500 mt-2">{formError}</p>}
        <motion.button
          className="mt-5 w-full bg-green-500 py-3 text-white rounded-lg shadow-lg"
          type="submit"
          disabled={!isModelLoaded}
        >
          Sign Up
        </motion.button>
        <p className="text-center mt-4 text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-green-400">Login</Link>
        </p>
      </form>
    </motion.div>
  );
};

export default SignUpPage;
