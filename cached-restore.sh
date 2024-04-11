#!/bin/bash

if cmp -s "package-lock.json" "node_modules/package-lock.json"; then
  echo "package-lock.json did not change, skipping install"
else
  echo "package-lock.json changed, reinstalling packages"
  npm config set registry https://registry.npmmirror.com
  npm ci
  cp package-lock.json node_modules/package-lock.json
fi
