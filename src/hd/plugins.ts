import { plugin as ethereumPlugin } from "./ethereum.plugin";
import { plugin as bscPlugin } from "./ethereum.plugin";
import { plugin as hecoPlugin } from "./ethereum.plugin";
import { plugin as polygonPlugin } from "./ethereum.plugin";
import { plugin as swtcPlugin } from "./swtc.plugin";
import { plugin as bvcadtPlugin } from "./swtc.plugin";
import { plugin as callPlugin } from "./swtc.plugin";
import { plugin as ripplePlugin } from "./swtc.plugin";
import { plugin as streamPlugin } from "./swtc.plugin";
import { plugin as bizainPlugin } from "./swtc.plugin";

interface IPluginMap {
  [key: string]: IHDPlugin;
}
const pluginMap: IPluginMap = {
  ethereum: ethereumPlugin,
  bsc: bscPlugin,
  heco: hecoPlugin,
  polygon: polygonPlugin,
  bvcadt: bvcadtPlugin,
  call: callPlugin,
  ripple: ripplePlugin,
  stream: streamPlugin,
  bizain: bizainPlugin,
  jingtum: swtcPlugin
};

export function getPluginByType<T extends IHDPlugin>(type: string): T {
  return pluginMap[type] as T;
}
