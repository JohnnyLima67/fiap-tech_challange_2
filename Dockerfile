# build
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
COPY tsup.config.ts ./
RUN npm run build

# production
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/build ./build

EXPOSE 3000

USER node

CMD ["node", "build/server.js"]