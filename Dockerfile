# Node JS offcial image for Node 22 (specifically required for this repo)
# Also a Linux container to meet compiling requirement
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install project dependencies using 'npm ci' (clean install)
RUN npm ci

# Bundle app source
COPY . .

# The app runs on port 8080 exposing it for the outside world
EXPOSE 8080

# Define the command to run your app
CMD [ "npm", "run", "dev" ]

