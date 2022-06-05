import Wallet from "ethereumjs-wallet";

export const plugin: IHDPlugin = {
  // const Wallet = WalletFactory("jingtum");
  address(privateKey: string): string {
    // check and cut swtc keypair lib add prefix 00
    const key = privateKey.length === 66 ? privateKey.substring(2) : privateKey;
    const buffer = Buffer.from(key, "hex");
    const wallet = Wallet.fromPrivateKey(buffer);
    return wallet.getAddressString();
  }

  // generate(language: string = "english"): IHDWallet {
  //   return null;
  // },
  // fromMnemonic(mnemonic: string): IHDWallet {
  //   return null;
  // },
  // fromSecret(secret: string): IHDWallet {
  //   return null;
  // },
  // sign(...args): any {

  // },
  // getHDWallet(...args): IHDWallet {
  //   return null;
  // }
};
