import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/date";
import VideoFeed from "./VideoFeed";
import FaceRecognition from "./FaceRecognition";
import { useState } from "react";

const DashboardPage = () => {
    const { user, logout } = useAuthStore();
    const [showVideoFeed, setShowVideoFeed] = useState(false);
    const [showFaceRecognition, setShowFaceRecognition] = useState(false);
    const [showMultiFaceVideo, setShowMultiFaceVideo] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const toggleVideoFeed = () => {
        setShowVideoFeed(!showVideoFeed);
    };

    const toggleFaceRecognition = () => {
        setShowFaceRecognition(!showFaceRecognition);
    };

    const toggleMultiFaceVideo = () => {
        setShowMultiFaceVideo(!showMultiFaceVideo);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
        >
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
                Dashboard
            </h2>

            <div className="space-y-6">
                {/* Profile Section */}
                <motion.div
                    className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-xl font-semibold text-green-400 mb-3">
                        Profile Information
                    </h3>
                    <p className="text-gray-300">Name: {user.name}</p>
                    <p className="text-gray-300">Email: {user.email}</p>
                </motion.div>

                {/* Account Activity Section */}
                <motion.div
                    className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="text-xl font-semibold text-green-400 mb-3">
                        Account Activity
                    </h3>
                    <p className="text-gray-300">
                        <span className="font-bold">Joined: </span>
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                    <p className="text-gray-300">
                        <span className="font-bold">Last Login: </span>
                        {formatDate(user.lastLogin)}
                    </p>
                </motion.div>

                {/* Crowd Counting Video Feed */}
                <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleVideoFeed}
                        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                            font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        {showVideoFeed ? "Hide Crowd Counting" : "Show Crowd Counting"}
                    </motion.button>
                </motion.div>

                {showVideoFeed && (
                    <motion.div
                        className="mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <VideoFeed title="Crowd Counting" src="http://localhost:5001/crowd_counting" />
                    </motion.div>
                )}

                {/* Multi-Face Video Feed */}
                <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleMultiFaceVideo}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                            font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        {showMultiFaceVideo
                            ? "Hide Multi-Face Recognition"
                            : "Show Multi-Face Recognition"}
                    </motion.button>
                </motion.div>

                {showMultiFaceVideo && (
                    <motion.div
                        className="mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <VideoFeed title="Multi-Face Recognition" src="http://localhost:5001/multi" />
                    </motion.div>
                )}

                {/* Face Recognition Section */}
                <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleFaceRecognition}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white 
                            font-bold rounded-lg shadow-lg hover:from-purple-600 hover:to-purple-700
                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        {showFaceRecognition ? "Hide Face Recognition" : "Show Face Recognition"}
                    </motion.button>
                </motion.div>

                {showFaceRecognition && (
                    <motion.div
                        className="mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <FaceRecognition />
                    </motion.div>
                )}

                {/* Logout Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                            font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        Logout
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default DashboardPage;
