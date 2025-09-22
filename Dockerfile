FROM node:current-alpine3.20

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY dist/apps/citation-buddy-bot/package.json ./

USER node

RUN npm i

COPY dist/apps/citation-buddy-bot /home/node/app/dist/citation-buddy-bot

EXPOSE 3000

WORKDIR /home/node/app/

CMD [ "node", "dist/citation-buddy-bot/main.js"]
