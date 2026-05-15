FROM oven/bun:1.1-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install --production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "src/index.ts"]
