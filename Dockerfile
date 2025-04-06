
FROM node:18

WORKDIR /app

# Install nginx
RUN apt update && apt install -y nginx

COPY nginx.conf /etc/nginx/sites-available/default
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080
CMD service nginx start && npm start
