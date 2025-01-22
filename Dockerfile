# Dockerizing the app to run in a linux container
# as my windows-build-tools aint working bruh (how to fix bigint in windows?)
FROM node:21.4.0-bookworm-slim

WORKDIR /app

COPY package*.json tsconfig.json ./

# Install required packages for building native modules
# modules to avoid bigint errors while using solana packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
