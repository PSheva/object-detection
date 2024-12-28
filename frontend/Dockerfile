FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=optional
COPY . .
EXPOSE 5173

# Запуск Vite
CMD ["npm", "run", "dev"]
