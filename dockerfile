FROM mhart/alpine-node:6

RUN mkdir -p /app
WORKDIR /app
COPY . /app

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python

RUN npm install

EXPOSE 3000
CMD ["node", "index.js"]