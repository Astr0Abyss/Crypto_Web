const DEFAULT_HILL_KEY = "3,3,2,5";
const HILL_FILE_MAGIC = [72, 73, 76, 76];
const HILL_HEADER_LENGTH = 8;

const positiveMod = (value, modulus) => ((value % modulus) + modulus) % modulus;

const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
};

const modInverse = (value, modulus) => {
  const normalized = positiveMod(value, modulus);
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((normalized * candidate) % modulus === 1) return candidate;
  }
  throw new Error(`Hill key determinant ${value} has no inverse modulo ${modulus}.`);
};

const parseMatrixValues = (key) => {
  const values = String(key || DEFAULT_HILL_KEY).match(/-?\d+/g)?.map(Number) || [];
  const size = Math.sqrt(values.length);
  if (!Number.isInteger(size) || ![2, 3].includes(size)) throw new Error("Hill key must be a 2x2 or 3x3 matrix.");
  return { size, matrix: Array.from({ length: size }, (_, row) => values.slice(row * size, row * size + size)) };
};

const determinant = (matrix) => {
  if (matrix.length === 2) return (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0]);
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return (a * ((e * i) - (f * h))) - (b * ((d * i) - (f * g))) + (c * ((d * h) - (e * g)));
};

const minor = (matrix, row, col) => matrix.filter((_, r) => r !== row).map((items) => items.filter((_, c) => c !== col));
const transpose = (matrix) => matrix[0].map((_, col) => matrix.map((row) => row[col]));

const inverseMatrix = (matrix, modulus) => {
  const det = positiveMod(determinant(matrix), modulus);
  if (gcd(det, modulus) !== 1) throw new Error(`Hill matrix is not invertible modulo ${modulus}.`);
  const detInverse = modInverse(det, modulus);
  if (matrix.length === 2) {
    const [[a, b], [c, d]] = matrix;
    return [[positiveMod(d * detInverse, modulus), positiveMod(-b * detInverse, modulus)], [positiveMod(-c * detInverse, modulus), positiveMod(a * detInverse, modulus)]];
  }
  const cofactors = matrix.map((row, r) => row.map((_, c) => (((r + c) % 2 === 0 ? 1 : -1) * determinant(minor(matrix, r, c)))));
  return transpose(cofactors).map((row) => row.map((value) => positiveMod(value * detInverse, modulus)));
};

const textToNumbers = (text, size) => {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (!clean) throw new Error("Hill text mode needs alphabetic text.");
  const padding = (size - (clean.length % size)) % size;
  return [...clean.padEnd(clean.length + padding, "X")].map((char) => char.charCodeAt(0) - 65);
};

const numbersToText = (numbers) => numbers.map((number) => String.fromCharCode(number + 65)).join("");

const transformText = (text, key, decrypt = false) => {
  const { size, matrix } = parseMatrixValues(key);
  const activeMatrix = decrypt ? inverseMatrix(matrix, 26) : matrix;
  const numbers = textToNumbers(text, size);
  const result = [];
  for (let index = 0; index < numbers.length; index += size) {
    const rowVector = numbers.slice(index, index + size);
    for (let col = 0; col < size; col += 1) {
      result.push(positiveMod(rowVector.reduce((sum, item, row) => sum + (item * activeMatrix[row][col]), 0), 26));
    }
  }
  return numbersToText(result);
};

const parseFileMatrix = (key, modulus) => {
  const { size, matrix } = parseMatrixValues(key);
  if (size !== 2) throw new Error("Hill file mode supports 2x2 matrices only.");
  const det = positiveMod(determinant(matrix), modulus);
  if (gcd(det, modulus) !== 1) throw new Error("Hill file key determinant must be invertible modulo 256.");
  return matrix.map((row) => row.map((value) => positiveMod(value, modulus)));
};

const transformBytes = (arrayBuffer, key, decrypt = false) => {
  const matrix = parseFileMatrix(key || DEFAULT_HILL_KEY, 256);
  const activeMatrix = decrypt ? inverseMatrix(matrix, 256) : matrix;
  const source = new Uint8Array(arrayBuffer);
  const needsPadding = source.length % 2 !== 0;
  const padded = new Uint8Array(source.length + (needsPadding ? 1 : 0));
  padded.set(source);
  const result = new Uint8Array(padded.length);
  for (let index = 0; index < padded.length; index += 2) {
    result[index] = positiveMod((padded[index] * activeMatrix[0][0]) + (padded[index + 1] * activeMatrix[1][0]), 256);
    result[index + 1] = positiveMod((padded[index] * activeMatrix[0][1]) + (padded[index + 1] * activeMatrix[1][1]), 256);
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
  const hasHeader = source.length >= HILL_HEADER_LENGTH && HILL_FILE_MAGIC.every((byte, index) => source[index] === byte);
  if (!hasHeader) return { payload: arrayBuffer, originalLength: null };
  return { payload: source.slice(HILL_HEADER_LENGTH).buffer, originalLength: new DataView(source.buffer, source.byteOffset, source.byteLength).getUint32(4, true) };
};

export const hillCipher = {
  id: "hill",
  label: "Hill Cipher",
  keyLabel: "Matrix Key",
  defaultKey: DEFAULT_HILL_KEY,
  keyPlaceholder: "Example: 2,3,3,6 or 17,17,5,21,18,21,2,2,19",
  description: "Hill cipher supports 2x2 and 3x3 row-vector matrices modulo 26.",
  encrypt: (text, key) => transformText(text, key, false),
  decrypt: (text, key) => transformText(text, key, true),
  encryptFile: (arrayBuffer, key) => addHillHeader(transformBytes(arrayBuffer, key, false), arrayBuffer.byteLength),
  decryptFile: (arrayBuffer, key) => {
    const { payload, originalLength } = readHillPayload(arrayBuffer);
    const decrypted = new Uint8Array(transformBytes(payload, key, true));
    return originalLength === null ? decrypted.buffer : decrypted.slice(0, originalLength).buffer;
  },
};
