/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import { useAuthStore } from "../store/authStore";
import {toast} from "react-toastify"
const LoginPage = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [image, setImage] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(null);
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
            resolve(detection.descriptor);
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
      const faceDescriptor = await extractFaceDescriptor(imageSrc);
      setImage(imageSrc);
      setImageError(null);
    } catch (err) {
      setImageError(err);
    }
  };

  const handleCameraToggle = () => {
    setIsCameraActive((prev) => !prev);
    setImage(null); // Reset captured image when toggling the camera
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError(null);

    if (!rollNumber.trim()) {
      setError("Please enter your roll number.");
      return;
    }

    if (!image) {
      setError("No face image captured. Please capture an image.");
      return;
    }

    try {
      const faceDescriptor = await extractFaceDescriptor(image);
      const { success, message } = await useAuthStore.getState().login(
        rollNumber,
        Array.from(faceDescriptor)
      );

      if (success) {
        alert(`Welcome back, ${rollNumber}!`);
        navigate("/"); // Redirect to dashboard
      }
     else {
        setError(message);
      }
    } catch (err) {
      setError("Failed to process login. Please try again.");
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
          Login to Mark Attendance
        </h2>
        <form onSubmit={handleLogin}>
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
                className="w-full h-48 bg-gray-300 rounded-lg"
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
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <motion.button
            className="w-full bg-purple-600 text-white py-3 rounded-lg mt-4"
            type="submit"
            disabled={!isModelLoaded}
          >
            Login
          </motion.button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          New around here?{" "}
          <a href="/signup" className="text-pink-500 underline">
            Sign Up
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

export default LoginPage;
