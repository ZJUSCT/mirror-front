FROM node:17-bullseye

COPY . ./
RUN yarn config set registry 'https://registry.npmmirror.com/' && yarn install && yarn run build
ENTRYPOINT ["yarn", "run", "serve"]
