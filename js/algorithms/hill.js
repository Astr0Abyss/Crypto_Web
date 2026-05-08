const DEFAULT_HILL_KEY = "3,3,2,5";
const HILL_FILE_MAGIC = [72, 73, 76, 76];
const HILL_HEADER_LENGTH = 8;

const positiveMod = (value, modulus) => ((value % modulus) + modulus) % modulus;

const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x;
};

const modInverse = (value, modulus) => {
  const normalized = positiveMod(value, modulus);
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((normalized * candidate) % modulus === 1) {
      return candidate;
    }
  }
  throw new Error(`Hill key determinant ${value} has no inverse modulo ${modulus}. Use another key.`);
};

const parseMatrix = (key, modulus) => {
  const values = key.split(",").map((item) => Number.parseInt(item.trim(), 10));
  if (values.length !== 4 || values.some((value) => Number.isNaN(value))) {
    throw new Error("Hill cipher key must be 4 numbers: a,b,c,d. Example: 3,3,2,5.");
  }

  const [a, b, c, d] = values.map((value) => positiveMod(value, modulus));
  const determinant = positiveMod((a * d) - (b * c), modulus);

  if (gcd(determinant, modulus) !== 1) {
    throw new Error(`Hill key determinant must be invertible modulo ${modulus}. Try 3,3,2,5.`);
  }

  return { a, b, c, d, determinant };
};

const invertMatrix = (matrix, modulus) => {
  const determinantInverse = modInverse(matrix.determinant, modulus);
  return {
    a: positiveMod(matrix.d * determinantInverse, modulus),
    b: positiveMod(-matrix.b * determinantInverse, modulus),
    c: positiveMod(-matrix.c * determinantInverse, modulus),
    d: positiveMod(matrix.a * determinantInverse, modulus),
  };
};

const transformPair = ([x, y], matrix, modulus) => [
  positiveMod((matrix.a * x) + (matrix.b * y), modulus),
  positiveMod((matrix.c * x) + (matrix.d * y), modulus),
];

const textToNumbers = (text) => {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (!clean) {
    throw new Error("Hill text mode needs alphabetic text.");
  }
  const padded = clean.length % 2 === 0 ? clean : `${clean}X`;
  return [...padded].map((char) => char.charCodeAt(0) - 65);
};

const numbersToText = (numbers) => numbers.map((number) => String.fromCharCode(number + 65)).join("");

const transformText = (text, key, decrypt = false) => {
  const matrix = parseMatrix(key || DEFAULT_HILL_KEY, 26);
  const activeMatrix = decrypt ? invertMatrix(matrix, 26) : matrix;
  const numbers = textToNumbers(text);
  const result = [];

  for (let index = 0; index < numbers.length; index += 2) {
    result.push(...transformPair([numbers[index], numbers[index + 1]], activeMatrix, 26));
  }

  return numbersToText(result);
};

const transformBytes = (arrayBuffer, key, decrypt = false) => {
  const matrix = parseMatrix(key || DEFAULT_HILL_KEY, 256);
  const activeMatrix = decrypt ? invertMatrix(matrix, 256) : matrix;
  const source = new Uint8Array(arrayBuffer);
  const needsPadding = source.length % 2 !== 0;
  const padded = new Uint8Array(source.length + (needsPadding ? 1 : 0));
  padded.set(source);

  const result = new Uint8Array(padded.length);
  for (let index = 0; index < padded.length; index += 2) {
    const [first, second] = transformPair([padded[index], padded[index + 1]], activeMatrix, 256);
    result[index] = first;
    result[index + 1] = second;
  }

  return result.buffer;
};

const addHillHeader = (encryptedBuffer, originalLength) => {
  const encrypted = new Uint8Array(encryptedBuffer);
  const output = new Uint8Array(HILL_HEADER_LENGTH + encrypted.length);
  output.set(HILL_FILE_MAGIC, 0);
  new DataView(output.buffer).setUint32(4, originalLength, true);
  output.set(encrypted, HILL_HEADER_LENGTH);
  return output.buffer;
};

const readHillPayload = (arrayBuffer) => {
  const source = new Uint8Array(arrayBuffer);
  const hasHeader = source.length >= HILL_HEADER_LENGTH
    && HILL_FILE_MAGIC.every((byte, index) => source[index] === byte);

  if (!hasHeader) {
    return {
      payload: arrayBuffer,
      originalLength: null,
    };
  }

  return {
    payload: source.slice(HILL_HEADER_LENGTH).buffer,
    originalLength: new DataView(source.buffer, source.byteOffset, source.byteLength).getUint32(4, true),
  };
};

export const hillCipher = {
  id: "hill",
  label: "Hill Cipher",
  keyLabel: "2x2 Matrix Key",
  defaultKey: DEFAULT_HILL_KEY,
  keyPlaceholder: "Example: 3,3,2,5",
  description: "Hill cipher uses a 2x2 invertible matrix. Text uses modulo 26; files use modulo 256 bytes.",
  encrypt: (text, key) => transformText(text, key, false),
  decrypt: (text, key) => transformText(text, key, true),
  encryptFile: (arrayBuffer, key) => addHillHeader(transformBytes(arrayBuffer, key, false), arrayBuffer.byteLength),
  decryptFile: (arrayBuffer, key) => {
    const { payload, originalLength } = readHillPayload(arrayBuffer);
    const decrypted = new Uint8Array(transformBytes(payload, key, true));
    return originalLength === null ? decrypted.buffer : decrypted.slice(0, originalLength).buffer;
  },
};
