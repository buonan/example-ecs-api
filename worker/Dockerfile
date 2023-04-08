FROM node:18-slim
WORKDIR /app
COPY package.json package-lock.json ./
COPY . .
RUN npm ci
CMD npm start