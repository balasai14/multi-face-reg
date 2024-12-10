import { motion } from "framer-motion";
import { useState } from "react";
import VideoFeed from "./VideoFeed";
import FaceRecognition from "./FaceRecognition";
import { useAuthStore } from "../store/authStore"; // Assuming you are using a store for user data

const DashboardPage = () => {
  const { user, logout } = useAuthStore(); // Accessing user info from auth store
  const [activeComponent, setActiveComponent] = useState(null);

  const handleLogout = () => {
    logout();
  };

  const handleClick = (component) => {
    setActiveComponent(activeComponent === component ? null : component);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex flex-col items-center justify-start p-8 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
      style={{
        backgroundImage: "url('/bg.jpg')", // Ensure the correct path to your image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fallback background color
      }}
    >
      {/* Header with centered VisionWave Logo */}
      <div className="flex flex-col items-center mb-6 w-full">
        <img
          src="/logo.jpg" // Replace with your logo image path
          alt="VisionWave Logo"
          className="w-16 h-16 mb-4"
        />
        <div className="text-center text-white">
          <p className="font-bold text-2xl">{user.name}</p>
          <p className="text-sm text-gray-300">{`Roll Number: ${user.rollNumber}`}</p>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
        Dashboard
      </h2>

      {/* Icons for selecting different functionalities */}
      <div className="flex justify-center space-x-8 mb-8">
        {/* Single Face Recognition */}
        <motion.img
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          src="/single.jpg" // Replace with your image path
          alt="Single Face Recognition"
          onClick={() => handleClick("single")}
          className="w-32 h-32 cursor-pointer rounded-lg shadow-lg"
        />

        {/* Multi-Face Recognition */}
        <motion.img
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          src="/multi.jpg" // Replace with your image path
          alt="Multi-Face Recognition"
          onClick={() => handleClick("multi")}
          className="w-32 h-32 cursor-pointer rounded-lg shadow-lg"
        />

        {/* Crowd Counting */}
        <motion.img
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          src="/crowd.jpg" // Replace with your image path
          alt="Crowd Counting"
          onClick={() => handleClick("crowd")}
          className="w-32 h-32 cursor-pointer rounded-lg shadow-lg"
        />
      </div>

      {/* Conditional rendering of the selected component */}
      <div className="mt-8 w-full">
        {activeComponent === "single" && <FaceRecognition />}
        {activeComponent === "multi" && (
          <VideoFeed title="Multi-Face Recognition" src="http://localhost:5001/multi" />
        )}
        {activeComponent === "crowd" && (
          <VideoFeed title="Crowd Counting" src="http://localhost:5001/crowd_counting" />
        )}
      </div>

      {/* Logout Button */}
      <div className="mt-8 w-full flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="py-3 px-6 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Logout
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
