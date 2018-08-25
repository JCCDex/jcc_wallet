var sjcl = require('./utils').sjcl;

var WalletGenerator = require('../wallet')({
  sjcl: sjcl
});

module.exports = WalletGenerator;

