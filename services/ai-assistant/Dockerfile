FROM node:20-alpine

WORKDIR /app

# This Dockerfile should be built from the root of the monorepo
# Copy package files from root
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the built application
COPY dist/services/ai-assistant ./dist/

# Expose port
EXPOSE 3002

# Start the application
CMD ["node", "dist/main.js"]
