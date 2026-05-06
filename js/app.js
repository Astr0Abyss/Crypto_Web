import { algorithms } from "./algorithms/index.js";
import {
  getElements,
  populateAlgorithmOptions,
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
      setMessage(els, "Encrypted successfully.");
    } else {
      els.plainText.value = result;
      addHistory("Decrypted", algorithm.label, source, result);
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
    const suffix = mode === "encrypt" ? ".hill" : ".decrypted";
    els.fileDownloadLink.href = url;
    els.fileDownloadLink.download = `${file.name}${suffix}`;
    els.fileDownloadLink.classList.remove("hidden");
    els.fileStatus.textContent = `${mode === "encrypt" ? "Encrypted" : "Decrypted"} ${file.name}. Use Download Result.`;
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
refreshIcons();

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
