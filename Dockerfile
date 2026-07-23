FROM node:20-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy entire source code (including public assets)
COPY . .

# Build production bundle (transpiles TS & copies public/ to dist/)
RUN npm run build

# Expose container port
EXPOSE 8080
ENV PORT=8080

# Start Express backend & static file server
CMD ["node", "server.js"]
