const RSA_PARAMS = {
  name: "RSA-OAEP",
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
};

const RSA_IMPORT_PARAMS = {
  name: "RSA-OAEP",
  hash: "SHA-256",
};

const bytesToBase64 = (buffer) => {
  let binary = "";
  new Uint8Array(buffer).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const base64ToBytes = (base64Text) => {
  try {
    const binary = atob(base64Text.replace(/\s+/g, ""));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    throw new Error("RSA input must be a valid Base64 encrypted message.");
  }
};

const parseJwk = (value, keyName) => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${keyName} must be valid JWK JSON.`);
  }
};

export const rsaState = {
  keyPair: null,
  publicJwk: "",
  privateJwk: "",
};

export const rsaCipher = {
  id: "rsa",
  label: "RSA-OAEP",
  keyLabel: "Key Pair",
  defaultKey: "RSA-OAEP / SHA-256",
  keyPlaceholder: "Use auto or manual JWK keys",
  description: "Real browser RSA-OAEP with SHA-256 and a 2048-bit key pair.",

  async generateKeyPair() {
    rsaState.keyPair = await crypto.subtle.generateKey(RSA_PARAMS, true, ["encrypt", "decrypt"]);
    rsaState.publicJwk = JSON.stringify(await crypto.subtle.exportKey("jwk", rsaState.keyPair.publicKey), null, 2);
    rsaState.privateJwk = JSON.stringify(await crypto.subtle.exportKey("jwk", rsaState.keyPair.privateKey), null, 2);
    return {
      publicJwk: rsaState.publicJwk,
      privateJwk: rsaState.privateJwk,
    };
  },

  async importKeyPair({ publicJwk, privateJwk }) {
    if (!publicJwk.trim() && !privateJwk.trim()) {
      throw new Error("Paste at least a public key or private key JWK.");
    }

    const imported = {};

    if (publicJwk.trim()) {
      imported.publicKey = await crypto.subtle.importKey(
        "jwk",
        parseJwk(publicJwk, "Public key"),
        RSA_IMPORT_PARAMS,
        true,
        ["encrypt"]
      );
      rsaState.publicJwk = publicJwk.trim();
    }

    if (privateJwk.trim()) {
      imported.privateKey = await crypto.subtle.importKey(
        "jwk",
        parseJwk(privateJwk, "Private key"),
        RSA_IMPORT_PARAMS,
        true,
        ["decrypt"]
      );
      rsaState.privateJwk = privateJwk.trim();
    }

    rsaState.keyPair = {
      publicKey: imported.publicKey || rsaState.keyPair?.publicKey || null,
      privateKey: imported.privateKey || rsaState.keyPair?.privateKey || null,
    };

    return rsaState.keyPair;
  },

  async ensureKeyPair() {
    if (rsaState.keyPair?.publicKey && rsaState.keyPair?.privateKey) {
      return rsaState.keyPair;
    }
    await this.generateKeyPair();
    return rsaState.keyPair;
  },

  async encrypt(text) {
    const keyPair = await this.ensureKeyPair();
    if (!keyPair.publicKey) {
      throw new Error("RSA encryption needs a public key.");
    }

    const encodedText = new TextEncoder().encode(text);
    if (encodedText.byteLength > 190) {
      throw new Error("RSA-OAEP can directly encrypt about 190 UTF-8 bytes with this 2048-bit key. Use shorter text.");
    }

    const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, keyPair.publicKey, encodedText);
    return bytesToBase64(encrypted);
  },

  async decrypt(cipherText) {
    const keyPair = await this.ensureKeyPair();
    if (!keyPair.privateKey) {
      throw new Error("RSA decryption needs the matching private key.");
    }

    try {
      const decrypted = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        keyPair.privateKey,
        base64ToBytes(cipherText)
      );
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      if (error.name === "OperationError") {
        throw new Error("RSA decrypt failed. Use ciphertext created with the matching public key.");
      }
      throw error;
    }
  },
};
