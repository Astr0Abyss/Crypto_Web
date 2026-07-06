const normalizeKey = (key) => {
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "");
  if (!cleanKey) {
    throw new Error("Vigenere cipher needs an alphabetic key, for example LEMON.");
  }
  return cleanKey;
};

const shiftLetter = (char, keyShift, direction) => {
  const code = char.charCodeAt(0);
  const isUppercase = code >= 65 && code <= 90;
  const isLowercase = code >= 97 && code <= 122;

  if (!isUppercase && !isLowercase) {
    return char;
  }

  const base = isUppercase ? 65 : 97;
  const shift = keyShift * direction;
  return String.fromCharCode(((code - base + shift + 26) % 26) + base);
};

const transformVigenere = (text, key, direction) => {
  const cleanKey = normalizeKey(key);
  const cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
  let keyIndex = 0;

  return [...cleanText].map((char) => {
    const keyShift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
    keyIndex += 1;
    return shiftLetter(char, keyShift, direction);
  }).join("");
};

export const vigenereCipher = {
  id: "vigenere",
  label: "Vigenere Cipher",
  keyLabel: "Keyword",
  defaultKey: "LEMON",
  keyPlaceholder: "Example: LEMON",
  description: "Vigenere cipher shifts each letter using a repeating alphabetic keyword.",
  encrypt: (text, key) => transformVigenere(text, key, 1),
  decrypt: (text, key) => transformVigenere(text, key, -1),
};
