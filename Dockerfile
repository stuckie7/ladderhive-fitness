# Use Node.js 18 LTS
FROM node:18.18.2

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Set environment to development
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=8080

# Build the application
RUN npm run build

# Start the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]
