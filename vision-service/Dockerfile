FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN mkdir -p /app/images /app/videos

CMD ["npm", "start"]
