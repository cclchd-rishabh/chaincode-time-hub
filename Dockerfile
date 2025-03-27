cat Dockerfile 
# Use the official Node.js 16 image based on Alpine
FROM node:18-alpine
 
# Set the working directory in the container
WORKDIR /usr/src/app
 
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
 
# Install app dependencies for production only
RUN npm i --force
 
# Copy the rest of the application code to the container
COPY . .
 
# Build the Next.js app
RUN npm run build
 
# Expose the port that the app runs on
EXPOSE 3000
 
# Define the command to run your Next.js app
CMD ["npm", "run", "start"]