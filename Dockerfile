FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck and sqlite3 for database checks
RUN apk add --no-cache curl sqlite

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

# Make startup script executable
RUN chmod +x /app/start-railway.sh

# Expose port (Railway will use $PORT env var)
EXPOSE 5173

# Set environment variables
ENV DB_TYPE=sqlite
ENV NODE_ENV=production

# Start with initialization script
CMD ["/app/start-railway.sh"]
