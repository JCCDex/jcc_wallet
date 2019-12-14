#!/bin/bash
npm run build

./node_modules/cross-env/src/bin/cross-env-shell.js MODE=$1 REPORT=$2 webpack

# ./compile.sh dev true
# ./compile.sh prod true


