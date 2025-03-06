
#=========== FOR LOCAL DEVELOPMENT ========


# FROM node:18
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --omit=optional
# COPY . .
# EXPOSE 4242

# CMD ["npm", "run", "dev"]


#=========== FOR REMOTE SERVER ========


FROM node:18 as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=optional

COPY . .
RUN npm run build 

FROM nginx:latest

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
