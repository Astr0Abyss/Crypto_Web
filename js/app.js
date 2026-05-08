import { algorithms } from "./algorithms/index.js";
import {
  getElements,
  populateAlgorithmOptions,
  renderCalculationFlow,
  renderAppShell,
  renderHistory,
  setBusy,
  setMessage,
} from "./ui/uiElements.js";

renderAppShell();

const els = getElements();
const state = {
  history: [],
};

const selectedAlgorithm = () => algorithms[els.algorithmSelect.value];

const refreshIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const updateCharCount = () => {
  els.charCount.textContent = els.plainText.value.length;
  els.inputHint.textContent = els.plainText.value.length ? "Payload loaded" : "Ready for input";
};

const addHistory = (type, algorithm, input, output) => {
  state.history.unshift({
    type,
    algorithm,
    preview: (output || input).slice(0, 54) || "Empty result",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });
  state.history = state.history.slice(0, 5);
  renderHistory(els, state.history);
  refreshIcons();
};

const buildFlowSteps = (algorithm, mode, input = "", key = "", result = "") => {
  const sampleInput = input.slice(0, 24) || "payload";
  const sampleResult = result.slice(0, 48) || "awaiting result";

  const flows = {
    caesar: [
      { label: "input", title: "Normalize Shift", detail: "Read the numeric shift from the key field and wrap it inside the alphabet range.", formula: `k = ${key || algorithm.defaultKey}\nk' = ((k mod 26) + 26) mod 26` },
      { label: "encrypt", title: "Move Letters", detail: "Each A-Z/a-z character is shifted while punctuation, spaces, and numbers pass through unchanged.", formula: mode === "decrypt" ? "P = (C - k') mod 26" : "C = (P + k') mod 26" },
      { label: "output", title: "Rebuild Text", detail: "Characters keep their original case and positions after transformation.", formula: `${sampleInput} -> ${sampleResult}` },
    ],
    shift: [
      { label: "key", title: "Custom Shift", detail: "Shift Cipher uses the same alphabet rotation idea but always expects a user-defined numeric shift.", formula: `shift = ${key || algorithm.defaultKey}` },
      { label: "formula", title: mode === "decrypt" ? "Reverse Rotation" : "Forward Rotation", detail: "The direction changes based on encryption or decryption.", formula: mode === "decrypt" ? "plain = (cipher - shift) mod 26" : "cipher = (plain + shift) mod 26" },
      { label: "output", title: "Preserve Non-Letters", detail: "Symbols are ignored by the math and copied into the output.", formula: `${sampleInput} -> ${sampleResult}` },
    ],
    rsa: [
      { label: "map", title: "Alphabet Mapping", detail: "Plain letters become numbers before RSA math runs.", formula: "A=1, B=2, ... Z=26, space=0" },
      { label: "rsa", title: mode === "decrypt" ? "Private Exponent" : "Public Exponent", detail: "Textbook RSA modular exponentiation transforms every mapped number.", formula: mode === "decrypt" ? "m = c^d mod n\nkey = (n,d)" : "c = m^e mod n\nkey = (n,e)" },
      { label: "result", title: "Number Stream", detail: "Encrypted output is a space-separated number stream; decrypted output maps numbers back to letters.", formula: `${sampleInput} -> ${sampleResult}` },
    ],
    vigenere: [
      { label: "keyword", title: "Repeat Keyword", detail: "The alphabetic keyword repeats across letters only; spaces and punctuation do not consume key characters.", formula: `key = ${(key || algorithm.defaultKey).toUpperCase()}` },
      { label: "shift", title: "Per-Letter Shift", detail: "Each key letter becomes a shift value from A=0 to Z=25.", formula: mode === "decrypt" ? "P_i = (C_i - K_i) mod 26" : "C_i = (P_i + K_i) mod 26" },
      { label: "output", title: "Stream Result", detail: "The keyword creates a different shift at each letter position.", formula: `${sampleInput} -> ${sampleResult}` },
    ],
    hill: [
      { label: "matrix", title: "Build 2x2 Matrix", detail: "The key becomes an invertible matrix. Text uses modulo 26 and files use modulo 256.", formula: `K = [a b; c d]\nkey = ${key || algorithm.defaultKey}` },
      { label: "blocks", title: "Process Pairs", detail: "Text is grouped into two-letter vectors; file bytes are grouped into two-byte vectors.", formula: mode === "decrypt" ? "P = K^-1 x C mod 26/256" : "C = K x P mod 26/256" },
      { label: "output", title: "Recombine Blocks", detail: "Text blocks become letters again. File blocks become downloadable encrypted/decrypted bytes.", formula: `${sampleInput} -> ${sampleResult}` },
    ],
  };

  return flows[algorithm.id] || [];
};

const updateCalculationFlow = (mode = "standby", input = "", key = "", result = "") => {
  const algorithm = selectedAlgorithm();
  renderCalculationFlow(els, {
    algorithm,
    mode,
    steps: buildFlowSteps(algorithm, mode, input, key || algorithm.defaultKey, result),
  });
  refreshIcons();
};

const updateAlgorithmMeta = () => {
  const algorithm = selectedAlgorithm();
  const isRsa = algorithm.id === "rsa";
  const isHill = algorithm.id === "hill";

  els.algorithmDescription.textContent = algorithm.description;
  els.keyLabel.textContent = algorithm.keyLabel;
  els.keyInput.value = algorithm.defaultKey;
  els.keyInput.placeholder = algorithm.keyPlaceholder;
  els.keyInput.disabled = false;
  els.keyInput.classList.toggle("opacity-60", els.keyInput.disabled);
  els.rsaPanel.classList.toggle("hidden", !isRsa);
  els.hillFilePanel.classList.toggle("hidden", !isHill);

  if (isRsa) {
    els.rsaPublicKey.value = algorithms.rsa.defaultKey;
    els.rsaPrivateKey.value = "391,235";
  }

  setMessage(els);
  updateCalculationFlow();
};

const runCrypto = async (mode) => {
  try {
    setMessage(els);
    setBusy(els, true);

    const algorithm = selectedAlgorithm();
    const source = mode === "encrypt" ? els.plainText.value : els.outputText.value;
    const key = algorithm.id === "rsa" && mode === "decrypt"
      ? els.rsaPrivateKey.value.trim()
      : els.keyInput.value.trim();

    if (!source.trim()) {
      throw new Error(`Enter text to ${mode}.`);
    }

    const result = await algorithm[mode](source, key);

    if (mode === "encrypt") {
      els.outputText.value = result;
      addHistory("Encrypted", algorithm.label, source, result);
      updateCalculationFlow("encryption", source, key, result);
      setMessage(els, "Encrypted successfully.");
    } else {
      els.plainText.value = result;
      addHistory("Decrypted", algorithm.label, source, result);
      updateCalculationFlow("decryption", source, key, result);
      setMessage(els, "Decrypted successfully.");
    }

    updateCharCount();
  } catch (error) {
    setMessage(els, error.message, "error");
  } finally {
    setBusy(els, false);
  }
};

const generateRsaKeys = async () => {
  try {
    setMessage(els);
    setBusy(els, true);
    els.rsaStatus.textContent = "Loading sample RSA key pair...";
    const keys = await algorithms.rsa.generateKeyPair();
    els.keyInput.value = keys.publicKey;
    els.rsaPublicKey.value = keys.publicKey;
    els.rsaPrivateKey.value = keys.privateKey;
    els.rsaStatus.textContent = "Sample keys active: public (391,3), private (391,235).";
    setMessage(els, "RSA sample key pair loaded.");
  } catch (error) {
    setMessage(els, error.message, "error");
  } finally {
    setBusy(els, false);
  }
};

const importRsaKeys = async () => {
  try {
    setMessage(els);
    setBusy(els, true);
    await algorithms.rsa.importKeyPair({
      publicKey: els.rsaPublicKey.value,
      privateKey: els.rsaPrivateKey.value,
    });
    els.keyInput.value = els.rsaPublicKey.value;
    els.rsaStatus.textContent = "Manual RSA keys are active.";
    setMessage(els, "Manual RSA keys imported.");
  } catch (error) {
    setMessage(els, error.message, "error");
  } finally {
    setBusy(els, false);
  }
};

const copyText = async (value, emptyMessage, successMessage) => {
  if (!value.trim()) {
    setMessage(els, emptyMessage, "error");
    return;
  }
  await navigator.clipboard.writeText(value);
  setMessage(els, successMessage);
};

const processHillFile = async (mode) => {
  try {
    setMessage(els);
    setBusy(els, true);

    const file = els.fileInput.files?.[0];
    if (!file) {
      throw new Error("Choose a photo or PDF file first.");
    }

    const algorithm = selectedAlgorithm();
    if (!algorithm.encryptFile || !algorithm.decryptFile) {
      throw new Error("File mode is available for Hill Cipher only.");
    }

    const source = await file.arrayBuffer();
    const result = mode === "encrypt"
      ? algorithm.encryptFile(source, els.keyInput.value.trim())
      : algorithm.decryptFile(source, els.keyInput.value.trim());

    const blob = new Blob([result], { type: mode === "encrypt" ? "application/octet-stream" : file.type || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const downloadName = mode === "encrypt"
      ? `${file.name}.hill`
      : file.name.endsWith(".hill")
        ? file.name.slice(0, -5)
        : `${file.name}.decrypted`;
    els.fileDownloadLink.href = url;
    els.fileDownloadLink.download = downloadName;
    els.fileDownloadLink.classList.remove("hidden");
    els.fileStatus.textContent = `${mode === "encrypt" ? "Encrypted" : "Decrypted"} ${file.name}. Use Download Result.`;
    updateCalculationFlow(`${mode} file`, file.name, els.keyInput.value.trim(), downloadName);
    setMessage(els, `File ${mode}ed successfully.`);
  } catch (error) {
    setMessage(els, error.message, "error");
  } finally {
    setBusy(els, false);
  }
};

populateAlgorithmOptions(els.algorithmSelect, algorithms);
updateAlgorithmMeta();
renderHistory(els, state.history);

els.encryptBtn.addEventListener("click", () => runCrypto("encrypt"));
if (els.decryptBtn) {
  els.decryptBtn.addEventListener("click", () => runCrypto("decrypt"));
}
els.algorithmSelect.addEventListener("change", updateAlgorithmMeta);
els.plainText.addEventListener("input", updateCharCount);
els.generateRsaBtn.addEventListener("click", generateRsaKeys);
els.importRsaBtn.addEventListener("click", importRsaKeys);
els.rsaPublicKey.addEventListener("input", () => {
  if (selectedAlgorithm().id === "rsa") {
    els.keyInput.value = els.rsaPublicKey.value;
  }
});
els.copyPublicKeyBtn.addEventListener("click", () => copyText(els.rsaPublicKey.value, "No public key to copy.", "Public key copied."));
els.copyPrivateKeyBtn.addEventListener("click", () => copyText(els.rsaPrivateKey.value, "No private key to copy.", "Private key copied."));
els.fileEncryptBtn.addEventListener("click", () => processHillFile("encrypt"));
els.fileDecryptBtn.addEventListener("click", () => processHillFile("decrypt"));

els.copyBtn.addEventListener("click", () => copyText(els.outputText.value, "Nothing to copy yet.", "Output copied."));

els.clearBtn.addEventListener("click", () => {
  els.plainText.value = "";
  els.outputText.value = "";
  updateCharCount();
  setMessage(els, "Cleared.");
});

if (els.clearHistoryBtn) {
  els.clearHistoryBtn.addEventListener("click", () => {
    state.history = [];
    renderHistory(els, state.history);
    setMessage(els, "History cleared.");
  });
}
