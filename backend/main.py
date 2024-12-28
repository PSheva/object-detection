from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import cv2
import tempfile
import json

MIN_CONFIDENCE = 0.5
MODEL_PATH = "./results/runs/detect/train/weights/best.pt"

model = YOLO(MODEL_PATH)

# Обробка відео з частотою 10 разів на секунду (кожні 0.1 секунди)
def process_video(video_path: str) -> list[dict]:
    video = cv2.VideoCapture(video_path)

    fps = video.get(cv2.CAP_PROP_FPS)
    frame_interval = max(1, int(fps / 10))  # Розрахунок інтервалу кадрів для 10 разів на секунду
    frame_count = 0

    results = []

    while video.isOpened():
        ret, frame = video.read()
        if not ret:
            break

        # Обробляємо тільки кожен frame_interval-й кадр
        if frame_count % frame_interval == 0:
            frame_height, frame_width, _ = frame.shape
            timestamp = round(frame_count / fps, 4)

            print(f"Frame: {frame_count} Time: {timestamp}s")

            detections = model(frame, verbose=False)

            frame_data = {
                "time": timestamp,
                "objects": []
            }

            for result in detections[0].boxes:
                confidence = float(result.conf[0])

                if confidence >= MIN_CONFIDENCE:
                    x1, y1, x2, y2 = [float(coord) for coord in result.xyxy[0]]  # Convert tensor to float
                    label = model.names[int(result.cls[0])]

                    frame_data["objects"].append(
                        {
                            "object-class": label,
                            "frame_coordinates": [
                                round(x1 / frame_width, 4),
                                round(y1 / frame_height, 4),
                                round(x2 / frame_width, 4),
                                round(y2 / frame_height, 4)
                            ]
                        }
                    )

            results.append(frame_data)

        frame_count += 1

    video.release()
    return results

app = FastAPI()

@app.post("/upload-video/")
async def upload_video(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name

    video_data = process_video(temp_file_path)

    return {"video_analysis": video_data}

###### Testing functions

def draw_rectangles_on_video(video_path: str, analysis_data: list, output_path: str) -> None:
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for output video
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frame_idx = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Get the corresponding analysis data for this frame
        if frame_idx < len(analysis_data):
            frame_data = analysis_data[frame_idx]

            # Draw each detected object's rectangle and label
            for obj in frame_data["objects"]:
                x1, y1, x2, y2 = obj["frame_coordinates"]
                x1, y1, x2, y2 = int(x1 * width), int(y1 * height), int(x2 * width), int(y2 * height)
                label = obj["object-class"]

                # Draw the rectangle
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

                # Add label text
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Write the frame to the output video
        out.write(frame)
        frame_idx += 1

    cap.release()
    out.release()
    print(f"Video with rectangles saved to {output_path}")

def load_analysis_data(json_file_path: str) -> list:
    with open(json_file_path, "r") as file:
        data = json.load(file)
    return data

def test_results():
    # Paths
    input_video = "test_video_cut.mp4"
    output_video = "test_video_cut_drawed.mp4"
    analysis_json = "results-cut.json"

    analysis_data = load_analysis_data(analysis_json)
    draw_rectangles_on_video(input_video, analysis_data, output_video)

from pathlib import Path

# Шлях до відео, яке потрібно обробити
input_video_path = "videos/test_7.mp4"

# Шлях до збереження JSON-файлу
output_json_path = "results_7.json"

# Обробка відео та отримання результатів
video_analysis = process_video(input_video_path)

# Збереження результатів у JSON-файл
with open(output_json_path, "w") as json_file:
    json.dump(video_analysis, json_file, indent=4)

print(f"Результати обробки збережено у файл: {output_json_path}")
