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
EXPOSE 4242

# Запуск серверу
CMD ["serve", "-s", "dist", "-l", "4242"]
