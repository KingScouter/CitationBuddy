FROM node:current-alpine3.23

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

RUN mkdir -p /home/node/app/db && \
    chown -R node:node /home/node/app

COPY dist/apps/quote-buddy-bot/package.json ./

USER node

RUN npm i

COPY dist/apps/quote-buddy-bot /home/node/app/dist/quote-buddy-bot

EXPOSE 3000

WORKDIR /home/node/app/

CMD [ "node", "dist/quote-buddy-bot/main.js"]
