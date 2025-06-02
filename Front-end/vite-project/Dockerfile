FROM node:18-alpine as build

WORKDIR /app

# Copy package files for better caching
COPY package*.json ./

# Install dependencies with explicit CI=false to avoid treating warnings as errors
RUN npm install

# Copy all source files
COPY . .

# Use Docker-specific environment variables
COPY .env.docker .env

# Build with CI=false to prevent build failures from warnings
RUN CI=false npm run build

# Production stage using Nginx
FROM nginx:alpine

# Copy built app to Nginx serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add special configuration for Docker networking
RUN echo "resolver 127.0.0.11 valid=10s;" > /etc/nginx/conf.d/resolver.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
