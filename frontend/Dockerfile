# For development on local machine
# FROM node:18
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --omit=optional
# COPY . .
# EXPOSE 5173

# CMD ["npm", "run", "dev"]


FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=optional

COPY . .

# Збірка фронтенду
RUN npm run build

# Встановлення HTTP-серверу для роздачі фронтенду
RUN npm install -g serve

EXPOSE 5173

# Запуск серверу
CMD ["serve", "-s", "dist", "-l", "5173"]
