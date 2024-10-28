# Dockerfile
FROM node:22-alpine

# Create working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application code
COPY . .

# Create directories and ensure they are writable
RUN mkdir -p /incoming /transcripts /archive && chmod 777 /incoming /transcripts /archive

# Default command to run the application
CMD ["node", "index.js"]