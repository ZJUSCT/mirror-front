FROM node:17-bullseye

COPY . ./
RUN yarn install && yarn run build
ENTRYPOINT ["yarn", "run serve"]
