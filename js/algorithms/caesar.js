const DEFAULT_CAESAR_SHIFT = 3;

const parseCaesarShift = (key) => {
  const shift = Number.parseInt(key, 10);
  if (Number.isNaN(shift)) {
    throw new Error("Caesar cipher needs a numeric shift, for example 3.");
  }
  return shift;
};

const rotateLetter = (char, shift) => {
  const code = char.charCodeAt(0);
  const isUppercase = code >= 65 && code <= 90;
  const isLowercase = code >= 97 && code <= 122;

  if (!isUppercase && !isLowercase) return char;

  const base = isUppercase ? 65 : 97;
  const normalizedShift = ((shift % 26) + 26) % 26;
  return String.fromCharCode(((code - base + normalizedShift) % 26) + base);
};

const transformCaesar = (text, key, direction) => {
  const shift = parseCaesarShift(key || DEFAULT_CAESAR_SHIFT);
  return [...text.toUpperCase().replace(/[^A-Z]/g, "")]
    .map((char) => rotateLetter(char, shift * direction))
    .join("");
};

export const caesarCipher = {
  id: "caesar",
  label: "Caesar Cipher",
  keyLabel: "Shift Value",
  defaultKey: String(DEFAULT_CAESAR_SHIFT),
  keyPlaceholder: "Example: 3",
  description: "Classic Caesar cipher. Each alphabet letter moves by your chosen shift value.",
  encrypt: (text, key) => transformCaesar(text, key, 1),
  decrypt: (text, key) => transformCaesar(text, key, -1),
};
