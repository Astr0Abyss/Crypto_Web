const DEFAULT_PUBLIC_KEY = "1147,7";
const DEFAULT_PRIVATE_KEY = "1147,463";

const alphabetToNumber = (char) => {
  if (char === " ") return 0;

  const code = char.toUpperCase().charCodeAt(0);
  if (code < 65 || code > 90) {
    throw new Error("RSA alphabet mode supports letters A-Z and spaces only.");
  }

  return code - 64;
};

const numberToAlphabet = (value) => {
  if (value === 0) return " ";
  if (value < 1 || value > 26) {
    throw new Error(`Decrypted value ${value} does not map to A=1 ... Z=26.`);
  }
  return String.fromCharCode(value + 64);
};

const parseKey = (keyText, exponentName) => {
  const [nText, exponentText] = keyText.split(",").map((item) => item.trim());
  const n = Number.parseInt(nText, 10);
  const exponent = Number.parseInt(exponentText, 10);

  if (!Number.isInteger(n) || !Number.isInteger(exponent)) {
    throw new Error(`Enter RSA key as n,${exponentName}. Example: ${exponentName === "e" ? DEFAULT_PUBLIC_KEY : DEFAULT_PRIVATE_KEY}`);
  }

  if (n <= 26) {
    throw new Error("RSA modulus n must be greater than 26 so A=1 ... Z=26 can fit.");
  }

  if (exponent <= 0) {
    throw new Error(`RSA exponent ${exponentName} must be positive.`);
  }

  return {
    nNumber: n,
    exponentNumber: exponent,
    n: BigInt(n),
    exponent: BigInt(exponent),
  };
};

const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y) {
    [x, y] = [y, x % y];
  }

  return x;
};

const extendedGcd = (a, b) => {
  if (b === 0) return { gcd: a, x: 1, y: 0 };
  const result = extendedGcd(b, a % b);
  return {
    gcd: result.gcd,
    x: result.y,
    y: result.x - Math.floor(a / b) * result.y,
  };
};

const modInverse = (value, modulus) => {
  const result = extendedGcd(value, modulus);
  if (result.gcd !== 1) {
    throw new Error(`RSA exponent ${value} is not coprime with phi(n)=${modulus}.`);
  }

  return ((result.x % modulus) + modulus) % modulus;
};

const factorModulus = (n) => {
  for (let factor = 2; factor <= Math.floor(Math.sqrt(n)); factor += 1) {
    if (n % factor === 0) {
      return [factor, n / factor];
    }
  }

  throw new Error("Cannot derive private key because n is not factorable as a small demo modulus.");
};

const derivePrivateKeyFromPublic = (publicKey) => {
  const { nNumber, exponentNumber: e } = parseKey(publicKey, "e");
  const [p, q] = factorModulus(nNumber);

  const phi = (p - 1) * (q - 1);
  const d = modInverse(e, phi);
  const warning = Math.min(p, q) <= 26
    ? "Use primes greater than 26 for full A-Z round-trip support."
    : "";

  return {
    publicKey: `${nNumber},${e}`,
    privateKey: `${nNumber},${d}`,
    p,
    q,
    phi,
    warning,
  };
};

const modPow = (base, exponent, modulus) => {
  let result = 1n;
  let current = BigInt(base) % modulus;
  let power = BigInt(exponent);

  while (power > 0n) {
    if (power % 2n === 1n) {
      result = (result * current) % modulus;
    }
    current = (current * current) % modulus;
    power = power / 2n;
  }

  return result;
};

export const rsaState = {
  publicKey: DEFAULT_PUBLIC_KEY,
  privateKey: DEFAULT_PRIVATE_KEY,
};

export const rsaCipher = {
  id: "rsa",
  label: "RSA Alphabet",
  keyLabel: "Public Key (n,e)",
  defaultKey: DEFAULT_PUBLIC_KEY,
  keyPlaceholder: "Example: 391,3",
  description: "RSA: A=1 ... Z=26, then each number is encrypted with c = m^e mod n.",

  generateKeyPair() {
    rsaState.publicKey = DEFAULT_PUBLIC_KEY;
    rsaState.privateKey = DEFAULT_PRIVATE_KEY;
    return {
      publicKey: rsaState.publicKey,
      privateKey: rsaState.privateKey,
    };
  },

  derivePrivateKey(publicKey) {
    return derivePrivateKeyFromPublic(publicKey);
  },

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

    return {
      publicKey: rsaState.publicKey,
      privateKey: rsaState.privateKey,
    };
  },

  encrypt(text, key = rsaState.publicKey) {
    const activeKey = key.trim() || rsaState.publicKey;
    const { n, exponent: e } = parseKey(activeKey, "e");

    return [...text.toUpperCase()]
      .map((char) => {
        const plainNumber = BigInt(alphabetToNumber(char));
        const encryptedNumber = modPow(plainNumber, e, n);
        return encryptedNumber.toString();
      })
      .join(" ");
  },

  decrypt(cipherText, key = rsaState.privateKey) {
    const activeKey = key.trim() || rsaState.privateKey;
    const { n, exponent: d } = parseKey(activeKey, "d");
    const encryptedNumbers = cipherText.trim().split(/\s+/).filter(Boolean);

    if (!encryptedNumbers.length || encryptedNumbers.some((value) => !/^\d+$/.test(value))) {
      throw new Error("RSA encrypted text must be numbers separated by spaces.");
    }

    return encryptedNumbers
      .map((encryptedNumber) => {
        const decryptedNumber = Number(modPow(BigInt(encryptedNumber), d, n));
        return numberToAlphabet(decryptedNumber);
      })
      .join("");
  },
};
