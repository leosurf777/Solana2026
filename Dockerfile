# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY dist/ ./dist/

# Create .env from example if it doesn't exist
COPY .env.example .env

# Expose port (if backend has HTTP server)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
