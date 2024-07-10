// forked from https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/util/src/internal.ts

export function padToEven(value: string): string {
  let a = value;

  if (typeof a !== "string") {
    throw new Error(`[padToEven] value must be type 'string', received ${typeof a}`);
  }

  if (a.length % 2) a = `0${a}`;

  return a;
}

export function isHexPrefixed(str: string): boolean {
  if (typeof str !== "string") {
    throw new Error(`[isHexPrefixed] input must be type 'string', received type ${typeof str}`);
  }

  return str[0] === "0" && str[1] === "x";
}

/**
 * Removes '0x' from a given `String` if present
 * @param str the string value
 * @returns the string without 0x prefix
 */
export const stripHexPrefix = (str: string): string => {
  if (typeof str !== "string") throw new Error(`[stripHexPrefix] input must be type 'string', received ${typeof str}`);

  return isHexPrefixed(str) ? str.slice(2) : str;
};
