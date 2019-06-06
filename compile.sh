#!/bin/bash
npm run build
npx babel ./node_modules/clone-deep  --out-dir ./node_modules/clone-deep
npx babel ./node_modules/shallow-clone --out-dir ./node_modules/shallow-clone

./node_modules/cross-env/dist/bin/cross-env-shell.js MODE=$1 REPORT=$2 webpack

# ./compile.sh dev true
# ./compile.sh prod true


