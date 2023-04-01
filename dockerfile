### Stage 1: build ###
FROM node:14.16.0-alpine as builder
LABEL maintainer="Daniel Goliszewski taafeenn@gmail.com"
LABEL version="0.3.4"

# Set working directory.
RUN mkdir /home-warehouse-ui
WORKDIR /home-warehouse-ui

# Copy app dependencies.
COPY package*.json /home-warehouse-ui/

# Install app dependencies.
RUN npm install @angular-devkit/build-angular
RUN npm install

# Copy app files.
COPY . /home-warehouse-ui

# Build app
CMD printf "export const environment = { production: true, apiIP: 'api/' };" > src/environments/environment.prod.ts; npm run build -- --output-path=/build_dir/output

