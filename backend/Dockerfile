FROM python:3.11
RUN apt-get update && apt-get install -y --no-install-recommends\
    build-essential \
    libopencv-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

# Команда для запуску сервера
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
