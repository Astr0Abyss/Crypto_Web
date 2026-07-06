const parseShiftKey = (key) => {
  const shift = Number.parseInt(key, 10);
  if (Number.isNaN(shift)) {
    throw new Error("Shift cipher needs a numeric key, for example 7.");
  }
  return ((shift % 26) + 26) % 26;
};

const shiftCharacter = (char, shift) => {
  const code = char.charCodeAt(0);
  const isUppercase = code >= 65 && code <= 90;
  const isLowercase = code >= 97 && code <= 122;

  if (!isUppercase && !isLowercase) return char;

  const base = isUppercase ? 65 : 97;
  const normalizedShift = ((shift % 26) + 26) % 26;
  return String.fromCharCode(((code - base + normalizedShift) % 26) + base);
};

const transformShift = (text, key, direction) => {
  const shift = parseShiftKey(key) * direction;
  return [...text.toUpperCase().replace(/[^A-Z]/g, "")]
    .map((char) => shiftCharacter(char, shift))
    .join("");
};

export const shiftCipher = {
  id: "shift",
  label: "Shift Cipher",
  keyLabel: "Shift Value",
  defaultKey: "7",
  keyPlaceholder: "Example: 7",
  description: "Custom shift cipher. The numeric key controls how far each letter moves.",
  encrypt: (text, key) => transformShift(text, key, 1),
  decrypt: (text, key) => transformShift(text, key, -1),
};
