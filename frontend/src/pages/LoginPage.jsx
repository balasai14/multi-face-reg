import { motion } from "framer-motion";
import Input from "../components/Input";
import Webcam from "react-webcam";
import { Clipboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as faceapi from "face-api.js";

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
	  // Sending roll number and face descriptor to the backend for validation
	  const response = await axios.post("/api/auth/login", {
		rollNumber,
		faceDescriptor: Array.from(faceDescriptor), // Convert to array
	  });
  
	  if (response.status === 200) {
		const user = response.data.user; // Ensure this is correctly returned from the backend
		if (user && user.name) {
		  alert(`Attendance marked for Roll Number: ${rollNumber}`);
		  navigate("/dashboard");
		} else {
		  setError("User name is missing in response.");
		}
	  } else {
		setError("Face does not match or user not found.");
	  }
	} catch (err) {
	  setError(err.response?.data?.message || err || "Login failed.");
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
