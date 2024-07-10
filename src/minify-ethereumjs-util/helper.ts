// forked from https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/util/src/helper.ts

/**
 * Throws if input is not a buffer
 * @param {Buffer} input value to check
 */
export const assertIsBytes = function(input: Uint8Array): void {
  if (!(input instanceof Uint8Array)) {
    const msg = `This method only supports Uint8Array but input was: ${input}`;
    throw new Error(msg);
  }
};
