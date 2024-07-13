export const toBEArray = (num: bigint, width: number): number[] => {
  const hex = num.toString(16);
  const buf = Buffer.from(hex.padStart(width * 2, "0").slice(0, width * 2), "hex");
  return Array.prototype.slice.call(buf, 0);
};

export const toBigInt = (data: Uint8Array): bigint => {
  let encoded = BigInt(0);
  for (let i = 0, l = data.length; i < l; i++) {
    encoded |= BigInt(data[i]) << ((BigInt(l) - BigInt(i) - BigInt(1)) * BigInt(8));
  }
  return encoded;
};
