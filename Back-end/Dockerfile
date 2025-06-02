FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including body-parser
RUN npm install
RUN npm install body-parser

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production

EXPOSE 3000

# Start the server with proper error logging
CMD ["node", "Server.js"]
