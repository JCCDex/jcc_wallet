const Ji = require("./lib").JingchangWallet;

Ji.generate("123456").then((wall) => {
  console.log(JSON.stringify(wall, null, 2))
})