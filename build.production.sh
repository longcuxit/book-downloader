#!/bin/bash

PUBLIC_URL='"https:\/\/longcuxit.github.io\/book-downloader\/build"'

for x in ./build/static/exts/*.user.js; do 
  sed -i '' -e "s/PUBLIC_URL/${PUBLIC_URL}/g" $x
done