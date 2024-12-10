import { useState } from "react";

const FaceRecognition = () => {
    const [trainingImage, setTrainingImage] = useState(null);
    const [testImage, setTestImage] = useState(null);
    const [prediction, setPrediction] = useState("");

    const handleTrainingUpload = (event) => {
        setTrainingImage(event.target.files[0]);
    };

    const handleTestUpload = (event) => {
        setTestImage(event.target.files[0]);
    };

    const trainModel = async () => {
        if (!trainingImage) {
            alert("Please upload a training image first.");
            return;
        }

        const formData = new FormData();
        formData.append("image", trainingImage);

        try {
            const response = await fetch("http://localhost:5001/train", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Model trained successfully.");
            } else {
                alert("Training failed. Please try again.");
            }
        } catch (error) {
            console.error("Error training the model:", error);
            alert("An error occurred during training.");
        }
    };

    const testModel = async () => {
        if (!testImage) {
            alert("Please upload a test image first.");
            return;
        }

        const formData = new FormData();
        formData.append("image", testImage);

        try {
            const response = await fetch("http://localhost:5001/test", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setPrediction(data.prediction || "Unknown");
            } else {
                alert("Testing failed. Please try again.");
            }
        } catch (error) {
            console.error("Error testing the model:", error);
            alert("An error occurred during testing.");
        }
    };

    return (
        <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">Face Recognition</h3>

            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Upload Training Image:</label>
                <input type="file" onChange={handleTrainingUpload} className="text-gray-300" />
                <button
                    onClick={trainModel}
                    className="mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
                >
                    Train Model
                </button>
            </div>

            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Upload Test Image:</label>
                <input type="file" onChange={handleTestUpload} className="text-gray-300" />
                <button
                    onClick={testModel}
                    className="mt-2 py-2 px-4 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
                >
                    Test Model
                </button>
            </div>

            {prediction && (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg text-gray-300">
                    <p className="font-bold">Prediction:</p>
                    <p>{prediction}</p>
                </div>
            )}
        </div>
    );
};

export default FaceRecognition;
