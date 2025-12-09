import { plugin as ethereumPlugin } from "./ethereum.plugin";
import { plugin as bscPlugin } from "./ethereum.plugin";
import { plugin as hecoPlugin } from "./ethereum.plugin";
import { plugin as polygonPlugin } from "./ethereum.plugin";
import { plugin as tronPlugin } from "./tron.plugin";
import { plugin as eosPlugin } from "./eos.plugin";
import { IHDPlugin, Alphabet } from "../types";
import { SWTCPlugin } from "./swtc.plugin";

export const bvcadtWallet = SWTCPlugin(Alphabet.BVCADT);
export const callWallet = SWTCPlugin(Alphabet.CALL);
export const rippleWallet = SWTCPlugin(Alphabet.RIPPLE);
export const stmWallet = SWTCPlugin(Alphabet.STREAM);
export const bizainWallet = SWTCPlugin(Alphabet.BIZAIN);
export const jtWallet = SWTCPlugin(Alphabet.JINGTUM);
export const ethWallet = ethereumPlugin;
export const moacWallet = ethereumPlugin;
export const eosWallet = eosPlugin;
export const tronWallet = tronPlugin;

interface IPluginMap {
  [key: string]: IHDPlugin;
}

const pluginMap: IPluginMap = {
  ethereum: ethereumPlugin,
  bsc: bscPlugin,
  heco: hecoPlugin,
  moac: ethereumPlugin,
  polygon: polygonPlugin,
  tron: tronPlugin,
  eos: eosPlugin,
  bvcadt: bvcadtWallet,
  call: callWallet,
  ripple: rippleWallet,
  stream: stmWallet,
  bizain: bizainWallet,
  jingtum: jtWallet,
  base: ethereumPlugin,
  arb1: ethereumPlugin
};

export function getPluginByType<T extends IHDPlugin>(type: string): T {
  return pluginMap[type] as T;
}
