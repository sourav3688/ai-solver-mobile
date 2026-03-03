# Use stable Node LTS
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Expo required ports
EXPOSE 19000 19001 19002 8081

# Fix file watching inside Docker
ENV CHOKIDAR_USEPOLLING=true
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start Expo in tunnel mode
CMD ["npx", "expo", "start", "-c", "--tunnel"]