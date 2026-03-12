FROM node:18-alpine

WORKDIR /app

# Install Python and other dependencies
RUN apk add --no-cache python3 py3-pip bash

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start server
CMD ["node", "server.js"]
