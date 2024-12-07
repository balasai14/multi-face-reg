/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import Input from "../components/Input";
import Webcam from "react-webcam";
import { Clipboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [image, setImage] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(null);
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

  // Helper function to extract face descriptor
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
    const imageSrc = webcamRef.current.getScreenshot();
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

  const handleLogin = async (e) => {
    e.preventDefault();
  
    setError(null);
  
    if (!rollNumber.trim()) {
      setError('Please enter your roll number.');
      return;
    }
  
    if (!image) {
      setError('No face image captured. Please capture an image.');
      return;
    }
  
    try {
      const faceDescriptor = await extractFaceDescriptor(image);
      const { success, message } = await useAuthStore.getState().login(rollNumber, Array.from(faceDescriptor));
  
      if (success) {
        alert(`Welcome back, ${rollNumber}!`);
        navigate('/'); // Redirect to dashboard
      } else {
        setError(message);
      }
    } catch (err) {
      setError('Failed to process login. Please try again.');
    }
  };
  
  
  
  

  return (
    <motion.div className="max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-400">Login to Mark Attendance</h2>
      <form onSubmit={handleLogin}>
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
            disabled={!isModelLoaded} // Disable until models are loaded
          >
            Capture Image
          </button>
          {imageError && <p className="text-red-500 mt-2">{imageError}</p>}
        </div>
        {image && <img src={image} alt="Captured" className="mt-4 rounded-lg" />}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <motion.button
          className="mt-5 w-full bg-green-500 py-3 text-white rounded-lg shadow-lg"
          type="submit"
          disabled={!isModelLoaded} // Disable until models are loaded
        >
          Login
        </motion.button>
      </form>
    </motion.div>
  );
};

export default LoginPage;
