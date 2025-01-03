# Frontend Dockerfile

# Use the official Node.js image as the base
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all frontend code
COPY . .

# Expose port 3000 for the frontend
EXPOSE 3000

# Start the React development server
CMD ["npm", "start"]
