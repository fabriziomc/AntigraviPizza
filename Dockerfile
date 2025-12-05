FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Remove devDependencies after build to reduce image size
RUN npm prune --production

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Set environment variables
ENV DB_TYPE=sqlite
ENV SQLITE_DB_PATH=/app/data/antigravipizza.db
ENV NODE_ENV=production

# Start server (serves both API and built frontend)
CMD ["node", "server/index.js"]
