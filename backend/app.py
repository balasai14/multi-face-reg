import cv2
import os
import numpy as np
from flask import Flask, Response
from sklearn.model_selection import train_test_split
from flask_cors import CORS
from ultralytics import YOLO

# Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# ---- Face Recognition Setup ----
# Path to the main folder with individual name folders
main_folder = "backend\\stage 2\\output_folder"

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
recognizer.save("backend\\stage 2\\best_model.yml")
print("Face recognition model trained and saved as 'best_model.yml'.")

# ---- YOLO Model Setup for Crowd Counting ----
model = YOLO('yolov8s.pt')  # Ensure you have the yolov8s.pt model file

# ---- Open Webcam for Both Functionalities ----
cap = cv2.VideoCapture(0)

# ---- Face Recognition Frame Generator ----
def gen_frames_face_recognition():
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

# ---- Crowd Counting Frame Generator ----
def gen_frames_crowd_counting():
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Resize frame for faster processing
        resized_frame = cv2.resize(frame, (640, 480))

        # Perform inference
        results = model(resized_frame)

        # Extract detection results
        detections = results[0].boxes.data  # Get detection data (tensor)

        # Draw bounding boxes and count people
        people_count = 0
        for detection in detections:
            xmin, ymin, xmax, ymax, conf, class_id = detection.tolist()
            if int(class_id) == 0:  # Class 0 corresponds to 'person'
                people_count += 1
                # Draw bounding box (blue color)
                cv2.rectangle(frame, (int(xmin), int(ymin)), (int(xmax), int(ymax)), (255, 0, 0), 2)

        # Display the people count
        cv2.putText(frame, f'People Count: {people_count}', (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)  # Red text

        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# ---- Flask Routes ----
@app.route('/multi')
def multi():
    return Response(gen_frames_face_recognition(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/crowd_counting')
def crowd_counting():
    return Response(gen_frames_crowd_counting(), mimetype='multipart/x-mixed-replace; boundary=frame')

# ---- Run the Flask App ----
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, threaded=True)
