FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY tsconfig.nestjs-services.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npx nx build estimate-service

# Expose port
EXPOSE 3022

# Start the application
CMD ["node", "dist/services/estimate-service/main.js"]
