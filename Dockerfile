FROM node:latest

WORKDIR /app
COPY . /app

RUN npm i 
RUN npm run build

EXPOSE 80

CMD ["npm", "start"]