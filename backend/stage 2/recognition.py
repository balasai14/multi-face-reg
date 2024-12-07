import cv2
import os
import numpy as np
from sklearn.model_selection import train_test_split
from flask import Flask, jsonify, Response

# Flask app setup
app = Flask(__name__)

# Path to the main folder with individual name folders
main_folder = "backend\stage 2\output_folder"

# Initialize face detector and recognizer
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
recognizer = cv2.face.LBPHFaceRecognizer_create()

# Labels and encodings
labels = []
training_images = []
training_labels = []

# Load training images and assign unique IDs to each person
for person_name in os.listdir(main_folder):
    person_folder = os.path.join(main_folder, person_name)
    
    for filename in os.listdir(person_folder):
        image_path = os.path.join(person_folder, filename)
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        
        # Preprocessing: Resize to a smaller size and normalize
        image = cv2.resize(image, (100, 100))
        image = cv2.equalizeHist(image)

        # Detect face in the image
        faces = face_cascade.detectMultiScale(image, scaleFactor=1.1, minNeighbors=4, minSize=(80, 80))
        
        for (x, y, w, h) in faces:
            face = image[y:y+h, x:x+w]
            training_images.append(face)
            training_labels.append(len(labels))

    labels.append(person_name)

# Split the data into training and validation sets
X_train, X_val, y_train, y_val = train_test_split(training_images, training_labels, test_size=0.2, random_state=42)

# Train the recognizer once with training data
recognizer.train(X_train, np.array(y_train))

# Save model
recognizer.save("backend\\stage 2\\best_model.yml")
print("Training complete. Model saved as 'best_model.yml'.")

# Open the webcam for real-time recognition (Flask will handle streaming)
cap = cv2.VideoCapture(0)

# Frame generator for real-time webcam video feed
def gen_frames():
    frame_skip = 3  # Predict every 3 frames for speed optimization
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % frame_skip != 0:
            continue  # Skip frames for optimization

        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray_frame = cv2.equalizeHist(gray_frame)

        # Detect faces in real-time
        faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=4, minSize=(80, 80))

        for (x, y, w, h) in faces:
            face = gray_frame[y:y+h, x:x+w]
            face = cv2.resize(face, (100, 100))

            # Perform prediction
            label, confidence = recognizer.predict(face)
            
            # Use name if confidence is below threshold
            if confidence < 100:
                name = labels[label]
            else:
                name = "Unknown"

            # Draw the rectangle around the face and add label
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 255, 0), 2)
            
            # Center text above the rectangle
            text_size = cv2.getTextSize(name, cv2.FONT_HERSHEY_SIMPLEX, 0.9, 2)[0]
            text_x = x + (w - text_size[0]) // 2
            text_y = y - 10

            cv2.putText(frame, name, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)

        # Encode the frame in JPEG
        _, jpeg = cv2.imencode('.jpg', frame)
        frame_bytes = jpeg.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n\r\n')

# Flask route to stream video
@app.route('/multi')
def multi():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Run the Flask app
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, threaded=True)
