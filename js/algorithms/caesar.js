const CAESAR_SHIFT = 3;

const rotateLetter = (char, shift) => {
  const code = char.charCodeAt(0);
  const isUppercase = code >= 65 && code <= 90;
  const isLowercase = code >= 97 && code <= 122;

  if (!isUppercase && !isLowercase) return char;

  const base = isUppercase ? 65 : 97;
  const normalizedShift = ((shift % 26) + 26) % 26;
  return String.fromCharCode(((code - base + normalizedShift) % 26) + base);
};

const transformCaesar = (text, direction) => {
  return [...text].map((char) => rotateLetter(char, CAESAR_SHIFT * direction)).join("");
};

export const caesarCipher = {
  id: "caesar",
  label: "Caesar Cipher",
  keyLabel: "Fixed Shift",
  defaultKey: String(CAESAR_SHIFT),
  keyPlaceholder: "Fixed at 3",
  description: "Classic Caesar cipher. Each alphabet letter moves by exactly 3 positions.",
  encrypt: (text) => transformCaesar(text, 1),
  decrypt: (text) => transformCaesar(text, -1),
};
