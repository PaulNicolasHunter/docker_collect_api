FROM node:12
WORKDIR /mints-pie
COPY package.json /mints-pie
RUN npm install
COPY . /mints-pie

CMD ["npm", "start"]