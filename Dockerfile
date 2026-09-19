FROM node:22-slim

# sharp cần libvips – có sẵn trong node:slim khi cài qua npm
# (sharp tự bundle prebuilt binary cho Linux x64)

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

CMD ["node", "src/index.js"]
