import { hillCipher } from "../algorithms/hill.js";

self.addEventListener("message", (event) => {
  const { id, mode, buffer, key } = event.data;

  try {
    const result = mode === "encrypt"
      ? hillCipher.encryptFile(buffer, key)
      : hillCipher.decryptFile(buffer, key);

    self.postMessage({ id, result }, [result]);
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
});
