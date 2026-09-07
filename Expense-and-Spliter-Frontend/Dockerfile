# Stage 1: Build the Vite + React Frontend
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve production assets with Nginx
FROM nginx:alpine AS production

# Copy compiled static assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy container Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
