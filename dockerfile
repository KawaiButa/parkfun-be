# Use the official Node.js 21 image as the base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the application
CMD ["npm", "run", "start:prod"]