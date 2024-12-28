from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from ultralytics import YOLO
import cv2
import tempfile
import json
from fastapi.middleware.cors import CORSMiddleware

# Ініціалізація FastAPI
app = FastAPI()

# Налаштування CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Можна замінити "*" на конкретний домен
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Налаштування моделі
MODEL_PATH = "./results/runs/detect/train/weights/best.pt"
MIN_CONFIDENCE = 0.5
model = YOLO(MODEL_PATH)

@app.post("/upload-video/")
async def upload_video(file: UploadFile = File(...)):
    """
    Обробка завантаженого відео та повернення JSON файлу з результатами детекції.
    """
    try:
        # Тимчасове збереження відео
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            temp_video.write(await file.read())
            temp_video_path = temp_video.name

        # Обробка відео
        video = cv2.VideoCapture(temp_video_path)
        fps = video.get(cv2.CAP_PROP_FPS)
        frame_interval = max(1, int(fps / 10))  # Інтервал для 10 кадрів в секунду
        frame_count = 0
        results = []

        while video.isOpened():
            ret, frame = video.read()
            if not ret:
                break

            if frame_count % frame_interval == 0:
                frame_height, frame_width, _ = frame.shape
                timestamp = round(frame_count / fps, 4)
                detections = model(frame, verbose=False)

                frame_data = {
                    "time": timestamp,
                    "objects": []
                }

                for result in detections[0].boxes:
                    confidence = float(result.conf[0])

                    if confidence >= MIN_CONFIDENCE:
                        x1, y1, x2, y2 = [float(coord) for coord in result.xyxy[0]]
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

        # Створення тимчасового JSON файлу
        with tempfile.NamedTemporaryFile(delete=False, suffix=".json", mode="w", encoding="utf-8") as temp_json:
            json.dump({"video_analysis": results}, temp_json, indent=4)
            temp_json_path = temp_json.name

        # Передача JSON файлу на фронтенд
        return FileResponse(temp_json_path, media_type="application/json", filename="video_analysis.json")

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
