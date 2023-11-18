import { plugin as ethereumPlugin } from "./ethereum.plugin";
import { plugin as bscPlugin } from "./ethereum.plugin";
import { plugin as hecoPlugin } from "./ethereum.plugin";
import { plugin as polygonPlugin } from "./ethereum.plugin";
import { plugin as tronPlugin } from "./tron.plugin";
import { plugin as eosPlugin } from "./eos.plugin";
// import { plugin as swtcPlugin } from "./swtc.plugin";
// import { plugin as bvcadtPlugin } from "./swtc.plugin";
// import { plugin as callPlugin } from "./swtc.plugin";
// import { plugin as ripplePlugin } from "./ripple.plugin";
// import { plugin as streamPlugin } from "./swtc.plugin";
// import { plugin as bizainPlugin } from "./swtc.plugin";
import { XWallet } from "./swtc.plugin";

interface IPluginMap {
  [key: string]: IHDPlugin;
}

const pluginMap: IPluginMap = {
  ethereum: ethereumPlugin,
  bsc: bscPlugin,
  heco: hecoPlugin,
  polygon: polygonPlugin,
  tron: tronPlugin,
  eos: eosPlugin,
  bvcadt: XWallet("bvcadt"),
  call: XWallet("call"),
  ripple: XWallet("ripple"),
  stream: XWallet("stream"),
  bizain: XWallet("bizain"),
  jingtum: XWallet("jingtum")
};

export function getPluginByType<T extends IHDPlugin>(type: string): T {
  return pluginMap[type] as T;
}
