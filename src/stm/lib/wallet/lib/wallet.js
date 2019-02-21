var Base58 = require('./base58');
var MasterKey = require('./master_key');
var StreamAddress = require('./stream_address');
var PublicGenerator = require('./public_generator');

module.exports = function (options) {
  var sjcl = options.sjcl; // inject sjcl dependency

  var base58 = Base58({
    sjcl: options.sjcl
  });;
  var masterKey = MasterKey({
    sjcl: options.sjcl
  });
  var streamAddress = StreamAddress({
    sjcl: options.sjcl
  });
  var generator = PublicGenerator({
    sjcl: options.sjcl
  });

  function firstHalfOfSHA512(bytes) {
    return sjcl.bitArray.bitSlice(
      sjcl.hash.sha512.hash(sjcl.codec.bytes.toBits(bytes)),
      0, 256
    );
  }

  function append_int(a, i) {
    return [].concat(a, i >> 24, (i >> 16) & 0xff, (i >> 8) & 0xff, i & 0xff)
  }

  function StreamWallet(secret) {
    this.secret = secret;

    if (!this.secret) {
      throw "Invalid secret."
    }
  }

  StreamWallet.prototype = {

    getPrivateKey: function (secret) {
      var self = this;
      return base58.decode_base_check(33, self.secret);
    },

    getPrivateGenerator: function (privateKey) {
      var i = 0;
      var privateGenerator;
      do {
        // Compute the hash of the 128-bit privateKey and the sequenceuence number
        privateGenerator = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(privateKey, i)));
        i++;
        // If the hash is equal to or greater than the SECp256k1 order, increment sequenceuence and try agin
      } while (!sjcl.ecc.curves.c256.r.greaterEquals(privateGenerator));
      return privateGenerator;
    },

    getPublicGenerator: function () {
      var privateKey = this.getPrivateKey(this.secret);
      var privateGenerator = this.getPrivateGenerator(privateKey);
      return generator.fromPrivateGenerator(privateGenerator);
    },

    getPublicKey: function (publicGenerator) {
      var sec;
      var i = 0;
      do {
        // Compute the hash of the public generator with the sub-sequence number
        sec = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(append_int(publicGenerator.toBytesCompressed(), 0), i)));
        i++;
        // If the hash is equal to or greater than the SECp256k1 order, increment the sequenceuence and retry
      } while (!sjcl.ecc.curves.c256.r.greaterEquals(sec));
      // Treating this hash as a private key, compute the corresponding public key as an EC point. 
      return sjcl.ecc.curves.c256.G.mult(sec).toJac().add(publicGenerator).toAffine();
    },

    getAddress: function () {
      var privateKey = this.getPrivateKey(this.secret);
      var privateGenerator = this.getPrivateGenerator(privateKey);
      var publicGenerator = generator.fromPrivateGenerator(privateGenerator).value;
      var publicKey = this.getPublicKey(publicGenerator);
      return streamAddress.fromPublicKey(publicKey);
    }
  }

  StreamWallet.getRandom = function () {
    var secretKey = masterKey.getRandom().value;
    return new StreamWallet(secretKey);
  };

  StreamWallet.generate = function () {
    /* Generate a 128-bit master key that can be used to make 
       any number of private / public key pairs and accounts
    */
    var secretKey = masterKey.getRandom().value;
    var wallet = new StreamWallet(secretKey);
    return {
      address: wallet.getAddress().value,
      secret: secretKey
    };
  };

  return StreamWallet;
};