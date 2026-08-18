# Use a lightweight Node.js 18 base image
FROM node:18-slim

# Install build dependencies for canvas/other packages if needed
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package installation files
COPY package*.json ./

# Install packages
RUN npm install

# Copy project source code
COPY . .

# Build TypeScript source code to JavaScript (dist/)
RUN npm run build

# Expose port (Render and Railway set process.env.PORT automatically)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
