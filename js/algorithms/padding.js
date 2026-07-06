const toHexByte = (value) => value.toString(16).toUpperCase().padStart(2, "0");

const parseBlockSize = (key) => {
  const blockSize = Number.parseInt(key, 10);
  if (!Number.isInteger(blockSize) || blockSize <= 0 || blockSize > 255) {
    throw new Error("Padding block size must be a number from 1 to 255.");
  }
  return blockSize;
};

const pad = (text, key) => {
  const blockSize = parseBlockSize(key || "16");
  const length = new TextEncoder().encode(text).length;
  const paddingNeeded = blockSize - (length % blockSize || blockSize);
  const padLength = paddingNeeded === 0 ? blockSize : paddingNeeded;
  return `${text} ${Array.from({ length: padLength }, () => toHexByte(padLength)).join(" ")}`;
};

export const pkcs5Padding = {
  id: "padding",
  label: "PKCS#5 Padding",
  keyLabel: "Block Size",
  defaultKey: "16",
  keyPlaceholder: "Example: 16",
  description: "Adds PKCS-style padding bytes for block-size test cases.",
  encrypt: pad,
  decrypt: (text) => text,
};
