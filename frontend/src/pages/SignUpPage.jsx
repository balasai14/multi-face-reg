/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [isCameraActive, setIsCameraActive] = useState(false); // For toggling the camera
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

  const extractFaceDescriptor = async (imgSrc) => {
    const img = document.createElement("img");
    img.src = imgSrc;

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!detection || !detection.descriptor) {
            reject("No face detected. Ensure your face is visible.");
          } else {
            resolve(Array.from(detection.descriptor)); // Convert Float32Array to a plain array
          }
        } catch (err) {
          reject("Face detection failed. Try again.");
        }
      };
    });
  };

  const handleCapture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setImageError("No image captured. Please try again.");
      return;
    }

    try {
      const descriptor = await extractFaceDescriptor(imageSrc);
      setFaceDescriptor(descriptor);
      setImage(imageSrc);
      setImageError(null); // Clear previous errors
    } catch (err) {
      setImageError(err);
    }
  };

  const handleCameraToggle = () => {
    setIsCameraActive((prev) => !prev);
    setImage(null); // Reset the captured image when toggling the camera
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name.trim() || !rollNumber.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }

    if (!faceDescriptor) {
      setFormError("Face descriptor is missing. Please capture a face image.");
      return;
    }

    const payload = {
      name,
      rollNumber,
      faceDescriptor,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 201) {
        navigate("/login"); // Redirect to login on successful signup
      }
    } catch (error) {
      setFormError(error.response?.data?.error || "Signup failed.");
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #0A0A0A, #38003C)", // Black to purple gradient
      }}
    >
      <div className="max-w-md bg-black p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Ready to Get Started? <br /> Create Your Account
        </h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg border border-gray-700 placeholder-gray-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Roll Number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg border border-gray-700 placeholder-gray-500"
            />
          </div>
          <div className="mb-4 relative">
            {isCameraActive && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-36 bg-gray-300 rounded-lg" // Webcam preview height is smaller
              />
            )}
            {image && <img src={image} alt="Captured" className="mt-4 rounded-lg" />}
          </div>
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={handleCameraToggle}
              className={`w-12 h-12 rounded-full ${
                isCameraActive ? "bg-red-500" : "bg-green-500"
              } flex items-center justify-center`}
            >
              {isCameraActive ? "Off" : "On"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleCapture}
            className="w-full bg-blue-500 text-white py-2 rounded-lg mb-4"
            disabled={!isModelLoaded || !isCameraActive}
          >
            Capture Image
          </button>
          {imageError && <p className="text-red-500 mt-2">{imageError}</p>}
          {formError && <p className="text-red-500 mt-2">{formError}</p>}
          <motion.button
            className="w-full bg-purple-600 text-white py-3 rounded-lg mt-4"
            type="submit"
            disabled={!isModelLoaded}
          >
            Sign Up
          </motion.button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          Have an account?{" "}
          <a href="/login" className="text-pink-500 underline">
            Log In
          </a>
        </p>
        <div className="mt-4 text-center">
          <img
            src="/logo.jpg" // Ensure this path points to the correct logo file
            alt="VisionWave Logo"
            className="mx-auto w-16 h-16"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SignUpPage;
