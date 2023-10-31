FROM node:18-bullseye

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn config set registry 'https://registry.npmmirror.com/' && \ 
    yarn config set sharp_binary_host https://npmmirror.com/mirrors/sharp && \ 
    yarn config set sharp_libvips_binary_host https://npmmirror.com/mirrors/sharp-libvips && \
    yarn install --frozen-lockfile

COPY . .
RUN yarn run build
CMD ["yarn", "run", "serve"]

