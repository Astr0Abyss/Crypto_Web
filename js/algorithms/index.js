import { caesarCipher } from "./caesar.js";
import { shiftCipher } from "./shift.js";
import { rsaCipher } from "./rsa.js";
// Hidden for now. Keep the files available so they can be added back later.
// import { hillCipher } from "./hill.js";
// import { vigenereCipher } from "./vigenere.js";

export const algorithms = {
  caesar: caesarCipher,
  shift: shiftCipher,
  rsa: rsaCipher,
  // vigenere: vigenereCipher,
  // hill: hillCipher,
};

if (typeof window !== "undefined") {
  window.algorithms = algorithms;
}
