FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install build tools for native dependencies (like bcrypt) on Alpine
RUN apk add --no-cache python3 make g++

# Install dependencies
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]