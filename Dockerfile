FROM node:10-alpine

COPY downloader.js /opt/nodejs-md5-downloader/
COPY package.json /opt/nodejs-md5-downloader/
WORKDIR /opt/nodejs-md5-downloader

RUN npm install
ENTRYPOINT ["node", "downloader.js"]
