# Build stage
FROM node:20-alpine AS builder

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/bim-cad-integration/package*.json ./services/bim-cad-integration/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY services/bim-cad-integration ./services/bim-cad-integration
COPY prisma ./prisma
COPY tsconfig.json ./
COPY nx.json ./

# Generate Prisma client
RUN npx prisma generate

# Build the service
RUN npm run build bim-cad-integration

# Runtime stage
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-rus \
    tesseract-ocr-data-eng \
    poppler-utils \
    cairo \
    jpeg \
    pango \
    giflib \
    librsvg

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist/services/bim-cad-integration ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Create upload directory
RUN mkdir -p /app/uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3025

# Expose port
EXPOSE 3025

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3025/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "dist/main.js"]
