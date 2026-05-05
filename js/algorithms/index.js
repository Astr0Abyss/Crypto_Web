import { caesarCipher } from "./caesar.js";
import { shiftCipher } from "./shift.js";
import { rsaCipher } from "./rsa.js";

export const algorithms = {
  caesar: caesarCipher,
  shift: shiftCipher,
  rsa: rsaCipher,
};

if (typeof window !== "undefined") {
  window.algorithms = algorithms;
}
