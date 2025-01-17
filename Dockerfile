FROM node:lts-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY src ./src

RUN npm run build

RUN npm prune --production

FROM node:lts-alpine AS production

USER 1001

WORKDIR /app

COPY --from=BUILD /app/node_modules ./node_modules

COPY --from=BUILD /app/dist .

CMD node main.js