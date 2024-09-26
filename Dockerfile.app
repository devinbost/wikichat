# Use an official Node.js runtime as a base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the app on port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]