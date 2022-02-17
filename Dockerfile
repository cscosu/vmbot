FROM node:17

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

ENV NODE_ENV=production

CMD ["nodemon"]
