import cv2
import os

# Load the pre-trained face classifier (Haar cascade)
face_classifier = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Function to detect faces and return the cropped face images
def detect_and_crop_faces(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_classifier.detectMultiScale(gray, 1.3, 5)

    face_images = []  # To store cropped face images

    if len(faces) == 0:
        return face_images, False

    for (x, y, w, h) in faces:
        # Crop the face from the original image
        cropped_face = img[y:y+h, x:x+w]
        face_images.append(cropped_face)

        # Draw a cyan rectangle around the detected face
        cv2.rectangle(img, (x, y), (x+w, y+h), (255, 255, 0), 2)  # Cyan color in BGR

    return face_images, True  # Return True if faces are detected

# Prompt for label name and set the main directory where you want to save the images
label_name = input("Enter the name for the folder label: ")
output_folder = "C:/Users/Prashanthj/Desktop/Face Recog/stage 2/output_folder"  # Change this to your existing directory path

# Ensure the main directory exists
if not os.path.exists(output_folder):
    print("The specified directory does not exist.")
    exit()

# Create a folder with the label name in the output folder
person_folder = os.path.join(output_folder, label_name)
os.makedirs(person_folder, exist_ok=True)

cap = cv2.VideoCapture(0)
image_count = 0  # To count the images saved for this run

while image_count < 150:  # Capture 150 images instead of 30
    ret, frame = cap.read()
    if not ret:
        break

    face_images, faces_detected = detect_and_crop_faces(frame)

    # Save each detected face as an image in the folder for the current person
    if faces_detected:
        for i, face in enumerate(face_images):
            # Save the face image in the person's folder
            frame_name = os.path.join(person_folder, f"face_capture_{image_count}.jpg")
            cv2.imwrite(frame_name, face)
            print(f"Saved: {frame_name}")
            image_count += 1

            # Stop capturing if 150 images have been saved
            if image_count >= 150:
                print(f"150 images captured for {person_folder}. Terminating program.")
                cap.release()
                cv2.destroyAllWindows()
                exit()  # Exit the script after capturing 150 images

    # Display the frame with detected faces and rectangles
    cv2.imshow("Video Face Detection", frame)

    # Break the loop when 'a' is pressed
    if cv2.waitKey(1) & 0xFF == ord('a'):
        break

cap.release()
cv2.destroyAllWindows()