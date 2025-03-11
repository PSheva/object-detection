
#=========== FOR LOCAL DEVELOPMENT ========


# FROM node:18
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --omit=optional
# COPY . .
# EXPOSE 4242

# CMD ["npm", "run", "dev"]


#=========== FOR REMOTE SERVER ========

# Етап білду: генеруємо статичні файли за допомогою Node.js
FROM node:18 AS builder

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо package.json та package-lock.json (або package*.json) і встановлюємо залежності
COPY package*.json ./
RUN npm ci --omit=optional

# Копіюємо решту файлів проєкту
COPY . .

# Будуємо статичні файли
RUN npm run build

# Перевірка: виводимо вміст папки з побудованими файлами
RUN ls -l /app/dist

# Фінальний етап: використання образу nginx для роздачі статичних файлів
FROM nginx:latest

# (На всякий випадок) Створюємо директорію для розміщення файлів
RUN mkdir -p /usr/share/nginx/html

# Копіюємо файли з білду у папку, яку використовує nginx для роздачі
COPY --from=builder /app/dist /usr/share/nginx/html

# Перевірка: виводимо вміст цільової директорії
RUN ls -l /usr/share/nginx/html

# Відкриваємо порт 80
EXPOSE 80

# Запускаємо nginx у foreground
CMD ["nginx", "-g", "daemon off;"]
