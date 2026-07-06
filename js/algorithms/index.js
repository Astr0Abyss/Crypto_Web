import { caesarCipher } from "./caesar.js";
import { shiftCipher } from "./shift.js";
import { rsaCipher, rsaNumericCipher } from "./rsa.js";
import { hillCipher } from "./hill.js";
import { vigenereCipher } from "./vigenere.js";
import { playfairCipher } from "./playfair.js";
import { pkcs5Padding } from "./padding.js";

export const algorithms = {
  caesar: caesarCipher,
  shift: shiftCipher,
  rsa: rsaCipher,
  rsaNumeric: rsaNumericCipher,
  vigenere: vigenereCipher,
  hill: hillCipher,
  playfair: playfairCipher,
  padding: pkcs5Padding,
};

if (typeof window !== "undefined") {
  window.algorithms = algorithms;
}
