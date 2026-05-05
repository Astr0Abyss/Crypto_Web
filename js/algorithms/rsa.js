const DEFAULT_PUBLIC_KEY = "391,3";
const DEFAULT_PRIVATE_KEY = "391,235";

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
    n: BigInt(n),
    exponent: BigInt(exponent),
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
  description: "Educational RSA: A=1 ... Z=26, then each number is encrypted with c = m^e mod n.",

  generateKeyPair() {
    rsaState.publicKey = DEFAULT_PUBLIC_KEY;
    rsaState.privateKey = DEFAULT_PRIVATE_KEY;
    return {
      publicKey: rsaState.publicKey,
      privateKey: rsaState.privateKey,
    };
  },

  importKeyPair({ publicKey, privateKey }) {
    if (publicKey.trim()) {
      parseKey(publicKey, "e");
      rsaState.publicKey = publicKey.trim();
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
