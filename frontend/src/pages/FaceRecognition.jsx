import { useState, useRef } from "react";

const FaceRecognition = () => {
    const [trainingName, setTrainingName] = useState("");
    const [trainingImage, setTrainingImage] = useState(null);
    const [testImage, setTestImage] = useState(null);
    const [prediction, setPrediction] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false); // To toggle camera
    const [isImageCaptured, setIsImageCaptured] = useState(false); // To track image capture status
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Start or stop the camera stream
    const toggleCamera = async () => {
        if (isCameraActive) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            } catch (error) {
                alert("Error accessing the camera. Please check your device settings.");
            }
        }
        setIsCameraActive(prevState => !prevState); // Toggle camera state
    };

    // Capture an image from the video feed and freeze the video
    const captureImage = (setImageCallback) => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                setImageCallback(blob);
            }, "image/jpeg");

            // Freeze the video feed by pausing it
            video.pause();
            setIsImageCaptured(true); // Mark image as captured
        }
    };

    // Resume the camera feed after capturing an image
    const resumeCamera = () => {
        if (isCameraActive && videoRef.current) {
            videoRef.current.play();
        }
    };

    // Train the model
    const handleTrain = async () => {
        if (!trainingName.trim()) {
            alert("Please enter a name for training.");
            return;
        }
        if (!trainingImage) {
            alert("Please capture a training image first.");
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("image", trainingImage);
        formData.append("name", trainingName);

        try {
            const response = await fetch("http://localhost:5001/train", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                alert("Model trained successfully!");
            } else {
                alert(`Training failed: ${data.error}`);
            }
        } catch (error) {
            alert("Error training model. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Predict the label after training
    const handlePredict = async () => {
        if (!testImage) {
            alert("Please capture a test image first.");
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("image", testImage);

        try {
            const response = await fetch("http://localhost:5001/predict", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setPrediction(data.prediction);
            } else {
                alert(`Prediction failed: ${data.error}`);
            }
        } catch (error) {
            alert("Error predicting. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-blue-400 mb-3">Face Recognition</h3>

            <div className="space-y-4">
                {/* Start/Stop Camera */}
                <div className="flex flex-col items-center">
                    <video
                        ref={videoRef}
                        className="rounded border border-gray-700"
                        autoPlay
                        muted
                        style={{ width: "100%", maxHeight: "300px" }}
                    />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <button
                        onClick={toggleCamera}
                        className="mt-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-600 hover:to-purple-700"
                    >
                        {isCameraActive ? "Stop Camera" : "Start Camera"}
                    </button>
                </div>

                {/* Training Section */}
                <div className="space-y-3">
                    <label className="block text-gray-300 mb-2">Enter Name for Training:</label>
                    <input
                        type="text"
                        value={trainingName}
                        onChange={(e) => setTrainingName(e.target.value)}
                        className="w-full bg-gray-700 text-gray-300 p-2 rounded mb-2"
                        placeholder="Enter name"
                    />
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => {
                                captureImage(setTrainingImage);
                                resumeCamera(); // Resume the camera after capturing
                            }}
                            className="py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700"
                            disabled={isImageCaptured} // Disable if image is captured
                        >
                            {isImageCaptured ? "Image Captured" : "Capture Training Image"}
                        </button>

                        <button
                            onClick={handleTrain}
                            className="py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700"
                        >
                            {isLoading ? "Training..." : "Train Model"}
                        </button>
                    </div>
                </div>

                {/* Prediction Section */}
                <div className="space-y-3">
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => {
                                captureImage(setTestImage);
                                resumeCamera();
                            }}
                            className="py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700"
                            disabled={isImageCaptured} // Disable if image is captured
                        >
                            {isImageCaptured ? "Image Captured" : "Capture Test Image"}
                        </button>

                        <button
                            onClick={handlePredict}
                            className="py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700"
                        >
                            {isLoading ? "Predicting..." : "Predict Identity"}
                        </button>
                    </div>

                    {prediction && <div className="mt-2 text-white">Predicted Identity: {prediction}</div>}
                </div>
            </div>
        </div>
    );
};

export default FaceRecognition;
