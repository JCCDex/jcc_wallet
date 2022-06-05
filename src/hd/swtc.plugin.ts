import { Factory as WalletFactory } from "@swtc/wallet";

export const plugin: IHDPlugin = {
  address(secret: string, chain: string): string {
    const Wallet = WalletFactory(chain);
    try {
      const wallet = Wallet.fromSecret(secret);
      return wallet.address;
    } catch (error) {
      return null;
    }
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
