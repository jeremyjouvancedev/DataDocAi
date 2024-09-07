# Use the official Node.js 16 image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY ./frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Install dependencies in development mode specifically (if needed)
RUN npm install --only=development

# Expose the port Next.js will run on
EXPOSE 3000

# Set environment variable for development
ENV NODE_ENV=development

WORKDIR /app/frontend

# Start the Next.js development server
CMD ["npm", "run", "dev"]
