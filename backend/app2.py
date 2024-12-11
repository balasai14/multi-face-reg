import os
import json
import cv2
import numpy as np
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.utils import to_categorical
from flask import Flask, request, jsonify
from flask_cors import CORS

# Suppress TensorFlow warnings and logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Constants
MODEL_PATH = "model.h5"
LABELS_PATH = "labels.json"
UPLOAD_DIR = "uploads"

# Global variables
model = None
labels = {}

# Helper functions
def preprocess_image(image_path):
    """Preprocess an image for prediction or training."""
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    image = cv2.resize(image, (64, 64))  # Resize to a fixed size
    image = image / 255.0  # Normalize pixel values
    return np.expand_dims(image, axis=-1)  # Add channel dimension

def initialize_model():
    """Initialize or load the model."""
    global model
    if os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)
    else:
        model = Sequential([
            Conv2D(32, (3, 3), activation="relu", input_shape=(64, 64, 1)),
            MaxPooling2D((2, 2)),
            Conv2D(64, (3, 3), activation="relu"),
            MaxPooling2D((2, 2)),
            Flatten(),
            Dense(128, activation="relu"),
            Dense(len(labels), activation="softmax")  
        ])
        model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

def load_labels():
    """Load label mappings from a JSON file."""
    global labels
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, "r") as f:
            labels.update(json.load(f))

def save_labels():
    """Save label mappings to a JSON file."""
    with open(LABELS_PATH, "w") as f:
        json.dump(labels, f)

# Routes
@app.route("/train", methods=["POST"])
def train_model():
    """Train the model with a new image and label."""
    global model, labels

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    name = request.form.get("name", "Unknown")

    # Create label directory if it doesn't exist
    label_dir = os.path.join(UPLOAD_DIR, name)
    os.makedirs(label_dir, exist_ok=True)
    image_path = os.path.join(label_dir, f"{len(os.listdir(label_dir)) + 1}.jpg")
    image_file.save(image_path)

    # Add label if not already present
    if name not in labels:
        labels[name] = len(labels)
        save_labels()

    # Preprocess all images and retrain the model
    x_train, y_train = [], []
    for label_name, label_index in labels.items():
        label_dir = os.path.join(UPLOAD_DIR, label_name)
        for image_file in os.listdir(label_dir):
            image_path = os.path.join(label_dir, image_file)
            image_data = preprocess_image(image_path)
            x_train.append(image_data)
            y_train.append(label_index)

    x_train = np.array(x_train)
    # Convert labels to one-hot encoding
    y_train = to_categorical(y_train, num_classes=len(labels))

    # Reinitialize the model with the updated number of classes
    model = Sequential([
        Conv2D(32, (3, 3), activation="relu", input_shape=(64, 64, 1)),
        MaxPooling2D((2, 2)),
        Conv2D(64, (3, 3), activation="relu"),
        MaxPooling2D((2, 2)),
        Flatten(),
        Dense(128, activation="relu"),
        Dense(len(labels), activation="softmax")  # Updated for new number of labels
    ])
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

    # Train the model
    model.fit(x_train, y_train, epochs=10, verbose=1)

    # Save the updated model
    model.save(MODEL_PATH)
    return jsonify({"message": f"Model trained successfully for {name}."})

@app.route("/predict", methods=["POST"])
def predict_model():
    """Predict the label for an uploaded image."""
    global model, labels

    if model is None:
        initialize_model()

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    image_path = os.path.join(UPLOAD_DIR, "test.jpg")
    image_file.save(image_path)
    image_data = preprocess_image(image_path)

    # Predict
    x_test = np.array([image_data])
    prediction = model.predict(x_test)
    predicted_label_index = np.argmax(prediction)

    # Map label index to name
    label_name = next((name for name, index in labels.items() if index == predicted_label_index), "Unknown")
    return jsonify({"prediction": label_name})

# Load resources
os.makedirs(UPLOAD_DIR, exist_ok=True)
load_labels()

# Start the server
if __name__ == "__main__":
    initialize_model()
    app.run(debug=True, port=5001)
