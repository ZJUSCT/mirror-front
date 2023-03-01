#!/bin/bash

md5sum yarn.lock || true
md5sum node_modules/yarn.lock || true

if cmp -s "yarn.lock" "node_modules/yarn.lock"; then
  echo "yarn.lock did not change, skipping install"
else
  echo "yarn.lock changed, reinstalling packages"
  yarn config set registry https://registry.npmmirror.com
  yarn config set sharp_binary_host https://npmmirror.com/mirrors/sharp
  yarn config set sharp_libvips_binary_host https://npmmirror.com/mirrors/sharp-libvips
  yarn install --frozen-lockfile
  sed -i 's/fonts.googleapis.com/fonts.loli.net/g' node_modules/gatsby-plugin-webfonts/modules/google.js
  cp yarn.lock node_modules/yarn.lock
fi
