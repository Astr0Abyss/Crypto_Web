const ALPHABET = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

const normalize = (value) => value.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");

const buildSquare = (key) => {
  const stream = `${normalize(key)}${ALPHABET}`;
  const letters = [...new Set([...stream])].slice(0, 25);
  const positions = new Map(letters.map((letter, index) => [letter, { row: Math.floor(index / 5), col: index % 5 }]));
  return { letters, positions };
};

const pairsForEncrypt = (text) => {
  const clean = normalize(text);
  const pairs = [];
  for (let index = 0; index < clean.length; index += 1) {
    const first = clean[index];
    let second = clean[index + 1] || "X";
    if (first === second) {
      second = "X";
    } else {
      index += 1;
    }
    pairs.push([first, second]);
  }
  return pairs;
};

const pairsForDecrypt = (text) => {
  const clean = normalize(text);
  if (clean.length % 2 !== 0) throw new Error("Playfair ciphertext length must be even.");
  return clean.match(/.{2}/g).map((pair) => [...pair]);
};

const transformPair = ([a, b], square, direction) => {
  const first = square.positions.get(a);
  const second = square.positions.get(b);

  if (first.row === second.row) {
    return [
      square.letters[(first.row * 5) + ((first.col + direction + 5) % 5)],
      square.letters[(second.row * 5) + ((second.col + direction + 5) % 5)],
    ];
  }

  if (first.col === second.col) {
    return [
      square.letters[(((first.row + direction + 5) % 5) * 5) + first.col],
      square.letters[(((second.row + direction + 5) % 5) * 5) + second.col],
    ];
  }

  return [
    square.letters[(first.row * 5) + second.col],
    square.letters[(second.row * 5) + first.col],
  ];
};

const transform = (text, key, decrypt = false) => {
  const square = buildSquare(key || "MONARCHY");
  const pairs = decrypt ? pairsForDecrypt(text) : pairsForEncrypt(text);
  return pairs.flatMap((pair) => transformPair(pair, square, decrypt ? -1 : 1)).join("");
};

export const playfairCipher = {
  id: "playfair",
  label: "Playfair Cipher",
  keyLabel: "Keyword",
  defaultKey: "MONARCHY",
  keyPlaceholder: "Example: MONARCHY",
  description: "Playfair uses a 5x5 key square with I/J combined.",
  encrypt: (text, key) => transform(text, key, false),
  decrypt: (text, key) => transform(text, key, true),
};
