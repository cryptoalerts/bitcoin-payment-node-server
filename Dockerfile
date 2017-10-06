FROM ubuntu:14.04
RUN apt-get update && apt-get install --yes curl && curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash - && apt-get install --yes nodejs

COPY ./*.js ./app/
COPY ./package.json ./app/package.json
COPY ./.nvmrc ./app/.nvmrc
COPY ./node_modules ./app/node_modules

ENV NODE_ENV production

CMD cd /app && npm start
