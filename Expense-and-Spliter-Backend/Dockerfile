# Multi-stage lightweight Node.js environment
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose backend port
EXPOSE 5000

# Environment variables defaults
ENV PORT=5000
ENV NODE_ENV=production

# Start Node server
CMD ["node", "server.js"]
