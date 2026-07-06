const DEFAULT_PUBLIC_KEY = "85,13";
const DEFAULT_PRIVATE_KEY = "85,5";

const alphabetToNumber = (char) => {
  const code = char.toUpperCase().charCodeAt(0);
  if (code < 65 || code > 90) throw new Error("RSA alphabet mode supports letters A-Z only.");
  return code - 65;
};

const numberToAlphabet = (value) => {
  if (value < 0 || value > 25) throw new Error(`Decrypted value ${value} does not map to A=0 ... Z=25.`);
  return String.fromCharCode(value + 65);
};

const parseKey = (keyText, exponentName) => {
  const parts = String(keyText || "").split(",").map((item) => item.trim()).map(Number);
  if (parts.length !== 2 || parts.some((value) => !Number.isInteger(value))) {
    throw new Error(`Enter RSA key as n,${exponentName}. Example: ${exponentName === "e" ? DEFAULT_PUBLIC_KEY : DEFAULT_PRIVATE_KEY}`);
  }
  const [n, exponent] = parts;
  if (n <= 25) throw new Error("RSA modulus n must be greater than 25.");
  if (exponent <= 0) throw new Error(`RSA exponent ${exponentName} must be positive.`);
  return { nNumber: n, exponentNumber: exponent, n: BigInt(n), exponent: BigInt(exponent) };
};

const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
};

const extendedGcd = (a, b) => {
  if (b === 0) return { gcd: a, x: 1, y: 0 };
  const result = extendedGcd(b, a % b);
  return { gcd: result.gcd, x: result.y, y: result.x - Math.floor(a / b) * result.y };
};

const modInverse = (value, modulus) => {
  const result = extendedGcd(value, modulus);
  if (result.gcd !== 1) throw new Error(`RSA exponent ${value} is not coprime with phi(n)=${modulus}.`);
  return ((result.x % modulus) + modulus) % modulus;
};

const factorModulus = (n) => {
  for (let factor = 2; factor <= Math.floor(Math.sqrt(n)); factor += 1) {
    if (n % factor === 0) return [factor, n / factor];
  }
  throw new Error("Cannot derive private key because n is not factorable as a small demo modulus.");
};

const derivePrivateKeyFromPublic = (publicKey) => {
  const { nNumber, exponentNumber: e } = parseKey(publicKey, "e");
  const [p, q] = factorModulus(nNumber);
  const phi = (p - 1) * (q - 1);
  const d = modInverse(e, phi);
  return { publicKey: `${nNumber},${e}`, privateKey: `${nNumber},${d}`, p, q, phi, warning: "" };
};

const modPow = (base, exponent, modulus) => {
  let result = 1n;
  let current = BigInt(base) % BigInt(modulus);
  let power = BigInt(exponent);
  const mod = BigInt(modulus);
  while (power > 0n) {
    if (power % 2n === 1n) result = (result * current) % mod;
    current = (current * current) % mod;
    power /= 2n;
  }
  return result;
};

export const rsaState = { publicKey: DEFAULT_PUBLIC_KEY, privateKey: DEFAULT_PRIVATE_KEY };

export const rsaCipher = {
  id: "rsa",
  label: "RSA Alphabet",
  keyLabel: "Public Key (n,e)",
  defaultKey: DEFAULT_PUBLIC_KEY,
  keyPlaceholder: "Example: 85,13",
  description: "RSA alphabet mode uses A=0 ... Z=25 and applies RSA letter by letter.",
  generateKeyPair() {
    rsaState.publicKey = DEFAULT_PUBLIC_KEY;
    rsaState.privateKey = DEFAULT_PRIVATE_KEY;
    return { publicKey: rsaState.publicKey, privateKey: rsaState.privateKey };
  },
  derivePrivateKey(publicKey) { return derivePrivateKeyFromPublic(publicKey); },
  importKeyPair({ publicKey, privateKey }) {
    if (publicKey.trim()) {
      const derived = derivePrivateKeyFromPublic(publicKey.trim());
      rsaState.publicKey = derived.publicKey;
      rsaState.privateKey = derived.privateKey;
    }
    if (privateKey.trim()) {
      parseKey(privateKey, "d");
      rsaState.privateKey = privateKey.trim();
    }
    return { publicKey: rsaState.publicKey, privateKey: rsaState.privateKey };
  },
  encrypt(text, key = rsaState.publicKey) {
    const { n, exponent: e } = parseKey(key.trim() || rsaState.publicKey, "e");
    return [...text.toUpperCase().replace(/[^A-Z]/g, "")].map((char) => modPow(alphabetToNumber(char), e, n).toString()).join(" ");
  },
  decrypt(cipherText, key = rsaState.privateKey) {
    const { n, exponent: d } = parseKey(key.trim() || rsaState.privateKey, "d");
    const encryptedNumbers = cipherText.trim().split(/\s+/).filter(Boolean);
    if (!encryptedNumbers.length || encryptedNumbers.some((value) => !/^\d+$/.test(value))) throw new Error("RSA encrypted text must be numbers separated by spaces.");
    return encryptedNumbers.map((encryptedNumber) => numberToAlphabet(Number(modPow(BigInt(encryptedNumber), d, n)))).join("");
  },
};

export const rsaNumericCipher = {
  id: "rsaNumeric",
  label: "RSA Numeric",
  keyLabel: "Params p,q,e or n,d",
  defaultKey: "131,163,127",
  keyPlaceholder: "Encrypt: p,q,e. Decrypt: n,d",
  description: "Pure RSA numeric mode for exam-style modular exponentiation.",
  encrypt(text, key) {
    const [p, q, e] = String(key || "").match(/-?\d+/g)?.map(Number) || [];
    const message = Number.parseInt(String(text).match(/-?\d+/)?.[0], 10);
    if (![p, q, e, message].every(Number.isInteger)) throw new Error("RSA Numeric encrypt needs p,q,e and numeric message.");
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    modInverse(e, phi);
    return modPow(message, e, n).toString();
  },
  decrypt(text, key) {
    const [n, d] = String(key || "").match(/-?\d+/g)?.map(Number) || [];
    const cipher = Number.parseInt(String(text).match(/-?\d+/)?.[0], 10);
    if (![n, d, cipher].every(Number.isInteger)) throw new Error("RSA Numeric decrypt needs n,d and numeric cipher.");
    return modPow(cipher, d, n).toString();
  },
};
