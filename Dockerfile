# pull the official base image
FROM node:16.14-alpine

# set working direction
WORKDIR /llm-chat

# add `/app/node_modules/.bin` to $PATH
ENV PATH /llm-chat/node_modules/.bin:$PATH

# add app
COPY . ./

# install application dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm i --force

# start app
CMD ["npm", "start"]