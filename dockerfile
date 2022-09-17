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
RUN npm run build -- --output-path=./dist/out

### Stage 2: delivery ###

FROM nginx:1.15.7-alpine
LABEL maintainer="Daniel Goliszewski taafeenn@gmail.com"
LABEL version="0.3.4"

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy output directory from builder to nginx image.
COPY --from=builder /home-warehouse-ui/dist/out /usr/share/nginx/html

# Copy nginx configuration file.
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
