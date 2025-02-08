import sys
import logging
import cv2
import tempfile
import json
import torch
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

# 🔹 Ініціалізація логування
logging.basicConfig(
    level=logging.INFO,  # Рівень логування
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),  # Вивід у термінал
        logging.FileHandler("logs.log", mode="a")  # Запис у файл
    ]
)

# 🔹 Ініціалізація FastAPI
app = FastAPI()

# 🔹 Налаштування CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Перевірка GPU
USE_GPU = torch.cuda.is_available()
DEVICE = "cuda" if USE_GPU else "cpu"

logging.info(f"🚀 Використовується GPU: {USE_GPU}")
logging.info(f"🖥️ Пристрій для обчислень: {DEVICE}")

# 🔹 Завантаження моделі YOLO
MODEL_PATH = "best.pt"
MIN_CONFIDENCE = 0.5
model = YOLO(MODEL_PATH).to(DEVICE)

@app.post("/upload-video/")
async def upload_video(file: UploadFile = File(...)):
    """
    Обробка відео та повернення JSON файлу з результатами детекції.
    """
    try:
        logging.info(f"🔄 Отримано відео: {file.filename}")

        # Тимчасове збереження відео
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            temp_video.write(await file.read())
            temp_video_path = temp_video.name

        # 📹 Відкриваємо відео
        video = cv2.VideoCapture(temp_video_path)
        fps = video.get(cv2.CAP_PROP_FPS)
        frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps if fps > 0 else 0

        logging.info(f"🎬 FPS: {fps:.2f}, 📊 Кадрів: {frame_count}, ⏱️ Тривалість: {duration:.2f} сек.")

        sys.stdout.flush()

        # 🔹 Аналіз кожного 10-го кадру, лог кожного 50-го кадру
        frame_interval = max(1, int(fps / 10))  
        frame_counter = 0
        results = []

        while video.isOpened():
            ret, frame = video.read()
            if not ret:
                break

            if frame_counter % frame_interval == 0:
                timestamp = round(frame_counter / fps, 4)
                detections = model(frame, verbose=False)

                frame_data = {"time": timestamp, "objects": []}

                for result in detections[0].boxes:
                    confidence = float(result.conf[0])

                    if confidence >= MIN_CONFIDENCE:
                        x1, y1, x2, y2 = [float(coord) for coord in result.xyxy[0]]
                        label = model.names[int(result.cls[0])]

                        frame_data["objects"].append(
                            {
                                "object-class": label,
                                "frame_coordinates": [
                                    round(x1 / frame.shape[1], 4),
                                    round(y1 / frame.shape[0], 4),
                                    round(x2 / frame.shape[1], 4),
                                    round(y2 / frame.shape[0], 4)
                                ]
                            }
                        )

                results.append(frame_data)

            # 🔹 Лог кожного 50-го кадру (глобальний статус)
            if frame_counter % 50 == 0 and frame_counter > 0:
                logging.info(f"🛠️ Кадр {frame_counter}: обробка триває...")

            sys.stdout.flush()
            frame_counter += 1

        video.release()

        # ✅ Завершення обробки
        logging.info(f"✅ Обробка завершена. Всього кадрів: {len(results)}")

        # Створення тимчасового JSON файлу
        with tempfile.NamedTemporaryFile(delete=False, suffix=".json", mode="w", encoding="utf-8") as temp_json:
            json.dump({"video_analysis": results}, temp_json, indent=4)
            temp_json_path = temp_json.name

        return FileResponse(temp_json_path, media_type="application/json", filename="video_analysis.json")

    except Exception as e:
        logging.error(f"❌ Помилка обробки відео: {str(e)}")
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
