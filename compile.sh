#!/bin/bash
npm run build
npx babel ./node_modules/clone-deep  --out-dir ./node_modules/clone-deep
npx babel ./node_modules/shallow-clone --out-dir ./node_modules/shallow-clone
npx babel ./node_modules/bs58/node_modules/base-x --out-dir ./node_modules/bs58/node_modules/base-x
npx babel ./node_modules/swtc-factory --out-dir ./node_modules/swtc-factory
npx babel ./node_modules/swtc-keypairs --out-dir ./node_modules/swtc-keypairs
npx babel ./node_modules/swtc-chains --out-dir ./node_modules/swtc-chains
npx babel ./node_modules/swtc-address-codec --out-dir ./node_modules/swtc-address-codec
npx babel ./node_modules/scryptsy --out-dir ./node_modules/scryptsy

./node_modules/cross-env/dist/bin/cross-env-shell.js MODE=$1 REPORT=$2 webpack

# ./compile.sh dev true
# ./compile.sh prod true


