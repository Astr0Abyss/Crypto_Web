import { algorithms } from "./algorithms/index.js";
import {
  getElements,
  populateAlgorithmOptions,
  renderCalculationFlow,
  renderAppShell,
  renderActivityChart,
  renderHistory,
  renderRsaOutputMap,
  setBusy,
  setMessage,
} from "./ui/uiElements.js";

renderAppShell();

const els = getElements();
const state = {
  history: [],
  guest: null,
  user: null,
  authToken: localStorage.getItem("cryptoToolkitAuthToken") || "",
  databaseReady: false,
  cryptoMode: "encrypt",
  lastRun: null,
  hillSize: 2,
};

const selectedAlgorithm = () => algorithms[els.algorithmSelect.value];
const guestStorageKey = "cryptoToolkitGuest";
const authTokenStorageKey = "cryptoToolkitAuthToken";

const refreshIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const updateCharCount = () => {
  els.charCount.textContent = els.plainText.value.length;
  els.inputHint.textContent = els.plainText.value.length ? "Payload loaded" : "Ready for input";
};

const activeIdentityId = () => state.user?.id || state.guest?.id || "guest";

const isRsaNumberStream = (value = "") => /^\s*\d+(?:\s+\d+)*\s*$/.test(value);

const setMode = (mode) => {
  state.cryptoMode = mode === "decrypt" ? "decrypt" : "encrypt";
  els.encryptModeBtn.classList.toggle("mode-toggle-active", state.cryptoMode === "encrypt");
  els.decryptModeBtn.classList.toggle("mode-toggle-active", state.cryptoMode === "decrypt");
  els.runIcon.setAttribute("data-lucide", "play");
  els.runLabel.textContent = "Run";
  validateActiveKey();
  refreshIcons();
};

const maybeAutoDetectMode = () => {
  if (!els.autoDetectToggle.checked || selectedAlgorithm().id !== "rsa") return;
  const candidate = els.outputText.value.trim() || els.plainText.value.trim();
  if (!candidate) return;
  setMode(isRsaNumberStream(candidate) ? "decrypt" : "encrypt");
};

const createGuestIdentity = () => {
  const id = `guest_${(crypto.randomUUID?.() || `${Date.now()}_${Math.random()}`).replace(/[^a-zA-Z0-9]/g, "")}`;
  return {
    id,
    displayName: `Guest ${id.slice(-6).toUpperCase()}`,
  };
};

const readGuestIdentity = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(guestStorageKey) || "null");
    if (saved?.id && saved?.displayName) {
      return saved;
    }
  } catch {
    localStorage.removeItem(guestStorageKey);
  }

  const guest = createGuestIdentity();
  localStorage.setItem(guestStorageKey, JSON.stringify(guest));
  return guest;
};

const updateGuestUi = () => {
  const activeName = state.user?.name || state.guest?.displayName || "Guest";
  if (els.guestBadge && (state.guest || state.user)) {
    els.guestBadge.classList.remove("hidden");
    els.guestBadge.querySelector("span").textContent = activeName;
  }

  if (els.accountLink) {
    els.accountLink.href = state.user ? "#signin" : "#signin";
    els.accountLink.querySelector("span").textContent = state.user ? "Account" : "Sign In";
  }

  if (els.accountTitle) {
    els.accountTitle.textContent = state.user ? `Signed in as ${state.user.name}` : (location.hash === "#signup" ? "Create account" : "Sign in");
  }

  if (els.accountStatus) {
    els.accountStatus.textContent = state.user
      ? `${state.user.email} is saving generations to your account.`
      : "Save generations to your account, or continue from the dashboard as a guest.";
  }

  if (els.logoutBtn) {
    els.logoutBtn.classList.toggle("hidden", !state.user);
  }

  if (els.syncStatus) {
    els.syncStatus.textContent = state.databaseReady
      ? `Saved generations for ${activeName}`
      : `Local history for ${activeName}; database not connected`;
  }
};

const updateRoute = () => {
  const isAuthRoute = location.hash === "#signin" || location.hash === "#signup";
  const isSignupRoute = location.hash === "#signup";

  els.authPage.classList.toggle("hidden", !isAuthRoute);
  els.dashboardView.classList.toggle("hidden", isAuthRoute);
  els.loginForm.classList.toggle("hidden", isSignupRoute || Boolean(state.user));
  els.signupForm.classList.toggle("hidden", !isSignupRoute || Boolean(state.user));
  els.showSignupBtn.classList.toggle("hidden", isSignupRoute || Boolean(state.user));
  els.showLoginBtn.classList.toggle("hidden", !isSignupRoute || Boolean(state.user));
  updateGuestUi();
  refreshIcons();
};

const apiRequest = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(path, {
    headers,
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Database request failed.");
  }
  return payload;
};

const generationToHistoryItem = (item) => ({
  type: item.mode === "decrypt" ? "Decrypted" : "Encrypted",
  algorithm: item.algorithm,
  preview: (item.output_text || item.input_text || "").slice(0, 54) || "Empty result",
  time: new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
});

const loadSavedGenerations = async () => {
  if (!state.guest) return;
  const payload = await apiRequest(`/api/generations?guestId=${encodeURIComponent(state.guest.id)}`);
  state.history = payload.generations.map(generationToHistoryItem);
  renderHistory(els, state.history);
  renderActivityChart(els, state.history);
  refreshIcons();
};

const initializeGuestSession = async () => {
  state.guest = readGuestIdentity();
  updateGuestUi();

  try {
    if (state.authToken) {
      const authPayload = await apiRequest("/api/auth/me");
      state.user = authPayload.user;
      if (!state.user) {
        state.authToken = "";
        localStorage.removeItem(authTokenStorageKey);
      }
    }

    const payload = await apiRequest("/api/session", {
      method: "POST",
      body: JSON.stringify({
        guestId: state.guest.id,
        displayName: state.guest.displayName,
      }),
    });
    state.guest = {
      id: payload.guest.id,
      displayName: payload.guest.display_name,
    };
    localStorage.setItem(guestStorageKey, JSON.stringify(state.guest));
    state.databaseReady = true;
    updateGuestUi();
    await loadSavedGenerations();
  } catch (error) {
    state.databaseReady = false;
    updateGuestUi();
    console.info(error.message);
  }
};

const setSignedInUser = async ({ user, token }) => {
  state.user = user;
  state.authToken = token;
  localStorage.setItem(authTokenStorageKey, token);
  state.databaseReady = true;
  updateGuestUi();
  await loadSavedGenerations();
  location.hash = "#dashboard";
  updateRoute();
  refreshIcons();
};

const runAuth = async (mode) => {
  try {
    setMessage(els);
    setBusy(els, true);

    const payload = mode === "signup"
      ? await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: els.signupName.value,
          email: els.signupEmail.value,
          password: els.signupPassword.value,
        }),
      })
      : await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: els.loginEmail.value,
          password: els.loginPassword.value,
        }),
      });

    await setSignedInUser(payload);
    els.signupForm.reset();
    els.loginForm.reset();
    setMessage(els, mode === "signup" ? "Account created and signed in." : "Signed in successfully.");
  } catch (error) {
    setMessage(els, error.message, "error");
  } finally {
    setBusy(els, false);
  }
};

const logout = async () => {
  try {
    setMessage(els);
    setBusy(els, true);
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.info(error.message);
  } finally {
    state.user = null;
    state.authToken = "";
    localStorage.removeItem(authTokenStorageKey);
    state.databaseReady = Boolean(state.guest);
    updateGuestUi();
    await loadSavedGenerations();
    setBusy(els, false);
    setMessage(els, "Signed out. Guest mode is active.");
  }
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
  renderActivityChart(els, state.history);
  refreshIcons();
};

const saveGeneration = async ({ mode, algorithm, input, output }) => {
  if (!state.guest) return;

  try {
    await apiRequest("/api/generations", {
      method: "POST",
      body: JSON.stringify({
        guestId: state.guest.id,
        displayName: state.guest.displayName,
        algorithm: algorithm.label,
        mode,
        inputText: input,
        outputText: output,
      }),
    });
    state.databaseReady = true;
    updateGuestUi();
  } catch (error) {
    state.databaseReady = false;
    updateGuestUi();
    console.info(error.message);
  }
};

const validateActiveKey = () => {
  const algorithm = selectedAlgorithm();
  let message = "Key ready";
  let ok = true;

  try {
    if (algorithm.id === "rsa") {
      if (state.cryptoMode === "decrypt") {
        algorithms.rsa.decrypt("1", els.rsaPrivateKey.value.trim());
      } else {
        algorithms.rsa.encrypt("A", els.rsaPublicKey.value.trim() || els.keyInput.value.trim());
      }
    } else if (algorithm.id === "rsaNumeric") {
      if (state.cryptoMode === "decrypt") {
        algorithm.decrypt("1", els.keyInput.value.trim() || "85,5");
      } else {
        algorithm.encrypt("1", els.keyInput.value.trim() || "5,17,13");
      }
    } else if (algorithm.id === "padding") {
      algorithm.encrypt("A", els.keyInput.value.trim());
    } else if (algorithm.id === "hill") {
      algorithm.encrypt("AB", els.keyInput.value.trim());
    } else {
      algorithm.encrypt("A", els.keyInput.value.trim());
    }
  } catch (error) {
    ok = false;
    message = error.message;
  }

  els.keyStatus.textContent = message;
  els.keyStatus.classList.toggle("key-status-ok", ok);
  els.keyStatus.classList.toggle("key-status-error", !ok);
  return ok;
};

const renderHillMatrixGrid = (size = state.hillSize, valuesText = els.keyInput.value) => {
  state.hillSize = size;
  const values = String(valuesText || "").match(/-?\d+/g)?.map(Number) || [];
  const fallback = size === 2 ? [3, 3, 2, 5] : [17, 17, 5, 21, 18, 21, 2, 2, 19];
  const activeValues = Array.from({ length: size * size }, (_, index) => values[index] ?? fallback[index] ?? 0);
  els.hillMatrixGrid.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
  els.hillMatrixGrid.innerHTML = activeValues.map((value, index) => `
    <input class="hill-matrix-cell field h-11 px-3 text-center font-mono text-sm" data-index="${index}" value="${value}" />
  `).join("");
  els.keyInput.value = activeValues.join(",");
  els.hillMatrixGrid.querySelectorAll(".hill-matrix-cell").forEach((input) => {
    input.addEventListener("input", syncHillMatrixFromGrid);
  });
};

const syncHillMatrixFromGrid = () => {
  const values = [...els.hillMatrixGrid.querySelectorAll(".hill-matrix-cell")].map((input) => input.value || "0");
  els.keyInput.value = values.join(",");
  validateActiveKey();
  previewCalculationFlow();
};

const applyRsaParams = () => {
  const p = Number.parseInt(els.rsaPInput.value, 10);
  const q = Number.parseInt(els.rsaQInput.value, 10);
  const e = Number.parseInt(els.rsaEInput.value, 10);
  const d = Number.parseInt(els.rsaDInput.value, 10);
  if (![p, q, e, d].every(Number.isInteger)) {
    setMessage(els, "Enter numeric p, q, e, and d values.", "error");
    return;
  }
  const n = p * q;
  els.rsaPublicKey.value = `${n},${e}`;
  els.rsaPrivateKey.value = `${n},${d}`;
  els.keyInput.value = els.rsaPublicKey.value;
  validateActiveKey();
  previewCalculationFlow();
  setMessage(els, `RSA keys applied with n=${n}.`);
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

const updateRsaOutputMap = (text = "", mode = "RSA decoded word") => {
  const isRsa = selectedAlgorithm().id === "rsa";
  els.rsaOutputMap.classList.toggle("hidden", !isRsa);
  if (isRsa) {
    renderRsaOutputMap(els, text, mode);
  }
};

const rsaCipherToCharacterEntries = (cipherText) => {
  return cipherText.trim().split(/\s+/)
    .filter((value) => /^\d+$/.test(value))
    .slice(0, 24)
    .map((value) => {
      try {
        const character = algorithms.rsa.decrypt(value, els.rsaPrivateKey.value.trim());
        return `${value} -> ${character === " " ? "space" : character}`;
      } catch {
        return `${value} -> ?`;
      }
    });
};

const rsaCharacterToCipherEntries = (text) => {
  return [...text.toUpperCase()]
    .filter((char) => char === " " || (char >= "A" && char <= "Z"))
    .slice(0, 24)
    .map((char) => {
      try {
        const cipherNumber = algorithms.rsa.encrypt(char, els.rsaPublicKey.value.trim());
        return `${char === " " ? "space" : char} -> ${cipherNumber}`;
      } catch {
        return `${char === " " ? "space" : char} -> ?`;
      }
    });
};

const syncDerivedRsaPrivateKey = ({ showMessage = false } = {}) => {
  if (selectedAlgorithm().id !== "rsa") return false;

  try {
    const keys = algorithms.rsa.derivePrivateKey(els.rsaPublicKey.value.trim());
    els.rsaPublicKey.value = keys.publicKey;
    els.keyInput.value = keys.publicKey;
    els.rsaPrivateKey.value = keys.privateKey;
    els.rsaStatus.textContent = `Derived private key using p=${keys.p}, q=${keys.q}, phi(n)=${keys.phi}.${keys.warning ? ` ${keys.warning}` : ""}`;
    if (showMessage) {
      setMessage(els, "Matching RSA private key derived.");
    }
    return true;
  } catch (error) {
    els.rsaStatus.textContent = error.message;
    if (showMessage) {
      setMessage(els, error.message, "error");
    }
    return false;
  }
};

const buildPreviewPairs = (algorithm, input = "", result = "") => {
  const sourceChars = [...input].slice(0, 6);
  const resultChars = [...result].slice(0, 6);

  if (!sourceChars.length) return [];

  if (algorithm.id === "rsa") {
    return sourceChars.map((char, index) => `${char.toUpperCase()} -> ${result.split(/\s+/)[index] || "?"}`);
  }

  if (algorithm.id === "hill") {
    const pairs = input.toUpperCase().replace(/[^A-Z]/g, "").match(/.{1,2}/g) || [];
    const outPairs = result.match(/.{1,2}/g) || [];
    return pairs.slice(0, 6).map((pair, index) => `${pair.padEnd(2, "X")} -> ${outPairs[index] || "?"}`);
  }

  return sourceChars.map((char, index) => `${char} -> ${resultChars[index] || "?"}`);
};

const updateCalculationFlow = (mode = "standby", input = "", key = "", result = "") => {
  const algorithm = selectedAlgorithm();
  renderCalculationFlow(els, {
    algorithm,
    mode,
    steps: buildFlowSteps(algorithm, mode, input, key || algorithm.defaultKey, result),
    binarySeed: `${algorithm.label}|${mode}|${input}|${key}|${result}`,
    preview: {
      input,
      key: key || algorithm.defaultKey,
      result,
      pairs: buildPreviewPairs(algorithm, input, result),
    },
  });
  refreshIcons();
};

const previewCalculationFlow = () => {
  const algorithm = selectedAlgorithm();
  const source = els.plainText.value;
  const key = algorithm.id === "rsa" ? els.rsaPublicKey.value.trim() || els.keyInput.value.trim() : els.keyInput.value.trim();

  if (!source.trim()) {
    updateCalculationFlow("live standby", "", key, "");
    return;
  }

  try {
    const result = algorithm.encrypt(source, key);
    updateCalculationFlow("live encryption", source, key, result);
  } catch (error) {
    updateCalculationFlow("input watch", source, key, error.message);
  }
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
  els.rsaOutputMap.classList.toggle("hidden", !isRsa);
  els.autoDetectWrap.classList.toggle("hidden", !isRsa);
  els.autoDetectWrap.classList.toggle("inline-flex", isRsa);

  if (isRsa) {
    els.rsaPublicKey.value = algorithms.rsa.defaultKey;
    els.rsaPrivateKey.value = "85,5";
    els.keyInput.value = algorithms.rsa.defaultKey;
    updateRsaOutputMap("", "RSA decoded word");
  }

  if (isHill) {
    renderHillMatrixGrid(Math.sqrt((algorithm.defaultKey.match(/-?\d+/g) || []).length) || 2, algorithm.defaultKey);
  }

  setMessage(els);
  validateActiveKey();
  maybeAutoDetectMode();
  previewCalculationFlow();
};

const runCrypto = async (mode) => {
  try {
    setMessage(els);
    maybeAutoDetectMode();
    mode = state.cryptoMode;
    if (!validateActiveKey()) {
      throw new Error("Fix the key before running.");
    }
    setBusy(els, true);

    const algorithm = selectedAlgorithm();
    if (algorithm.id === "rsa" && mode === "encrypt" && !syncDerivedRsaPrivateKey({ showMessage: false })) {
      throw new Error(els.rsaStatus.textContent);
    }

    const source = mode === "encrypt" ? els.plainText.value : els.outputText.value;
    const key = algorithm.id === "rsa"
      ? (mode === "decrypt" ? els.rsaPrivateKey.value.trim() : els.rsaPublicKey.value.trim())
      : els.keyInput.value.trim();

    if (!source.trim()) {
      throw new Error(`Enter text to ${mode}.`);
    }

    const result = await algorithm[mode](source, key);

    if (mode === "encrypt") {
      els.outputText.value = result;
      state.lastRun = { mode, algorithm, input: source, output: result };
      addHistory("Encrypted", algorithm.label, source, result);
      await saveGeneration({ mode, algorithm, input: source, output: result });
      updateCalculationFlow("encryption", source, key, result);
      if (algorithm.id === "rsa") {
        updateRsaOutputMap(rsaCipherToCharacterEntries(result), "cipher number -> character");
      }
      setMessage(els, "Encrypted successfully.");
    } else {
      els.plainText.value = result;
      state.lastRun = { mode, algorithm, input: source, output: result };
      addHistory("Decrypted", algorithm.label, source, result);
      await saveGeneration({ mode, algorithm, input: source, output: result });
      updateCalculationFlow("decryption", source, key, result);
      if (algorithm.id === "rsa") {
        updateRsaOutputMap(rsaCharacterToCipherEntries(result), "character -> cipher number");
      }
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
    els.rsaStatus.textContent = `Sample keys active: public (${keys.publicKey}), private (${keys.privateKey}).`;
    previewCalculationFlow();
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
    syncDerivedRsaPrivateKey();
    previewCalculationFlow();
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

const downloadOutputText = () => {
  const value = els.outputText.value.trim();
  if (!value) {
    setMessage(els, "Nothing to download yet.", "error");
    return;
  }
  const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `crypto-output-${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  setMessage(els, "Output downloaded.");
};

const saveCurrentOutput = async () => {
  const algorithm = selectedAlgorithm();
  const output = els.outputText.value.trim();
  const input = state.cryptoMode === "decrypt" ? output : els.plainText.value;
  if (!output) {
    setMessage(els, "Nothing to save yet.", "error");
    return;
  }
  const mode = state.lastRun?.output === output ? state.lastRun.mode : state.cryptoMode;
  const source = state.lastRun?.output === output ? state.lastRun.input : input;
  addHistory(mode === "decrypt" ? "Decrypted" : "Encrypted", algorithm.label, source, output);
  await saveGeneration({ mode, algorithm, input: source, output });
  setMessage(els, "Output saved to history.");
};

const clearOutput = () => {
  els.outputText.value = "";
  updateRsaOutputMap("", "RSA decoded word");
  setMessage(els, "Output cleared.");
};

const swapToDecrypt = () => {
  if (!els.outputText.value.trim()) {
    setMessage(els, "Encrypt something first, then swap.", "error");
    return;
  }
  setMode("decrypt");
  els.outputText.focus();
  previewCalculationFlow();
  setMessage(els, "Decrypt mode ready.");
};

const runHillFileWorker = (mode, buffer, key, algorithm) => {
  if (!window.Worker) {
    return Promise.resolve(mode === "encrypt"
      ? algorithm.encryptFile(buffer, key)
      : algorithm.decryptFile(buffer, key));
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker("./js/workers/hillFileWorker.js", { type: "module" });
    const id = crypto.randomUUID?.() || String(Date.now());
    worker.addEventListener("message", (event) => {
      if (event.data.id !== id) return;
      worker.terminate();
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data.result);
      }
    });
    worker.addEventListener("error", (error) => {
      worker.terminate();
      reject(error);
    });
    worker.postMessage({ id, mode, buffer, key }, [buffer]);
  });
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
    const result = await runHillFileWorker(mode, source, els.keyInput.value.trim(), algorithm);

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
renderActivityChart(els, state.history);
setMode("encrypt");
initializeGuestSession();
updateRoute();
window.addEventListener("hashchange", updateRoute);

els.signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  runAuth("signup");
});
els.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  runAuth("login");
});
els.showSignupBtn.addEventListener("click", () => {
  location.hash = "#signup";
});
els.showLoginBtn.addEventListener("click", () => {
  location.hash = "#signin";
});
els.logoutBtn.addEventListener("click", logout);
els.encryptModeBtn.addEventListener("click", () => setMode("encrypt"));
els.decryptModeBtn.addEventListener("click", () => setMode("decrypt"));
els.runBtn.addEventListener("click", () => runCrypto(state.cryptoMode));
els.swapBtn.addEventListener("click", swapToDecrypt);
els.algorithmSelect.addEventListener("change", updateAlgorithmMeta);
els.plainText.addEventListener("input", () => {
  updateCharCount();
  maybeAutoDetectMode();
  validateActiveKey();
  previewCalculationFlow();
  updateRsaOutputMap("", "RSA decoded word");
});
els.outputText.addEventListener("input", () => {
  maybeAutoDetectMode();
  validateActiveKey();
  if (selectedAlgorithm().id === "rsa") {
    updateRsaOutputMap(rsaCipherToCharacterEntries(els.outputText.value), "cipher number -> character");
  }
});
els.keyInput.addEventListener("input", () => {
  if (selectedAlgorithm().id === "rsa") {
    els.rsaPublicKey.value = els.keyInput.value;
    syncDerivedRsaPrivateKey();
  }
  if (selectedAlgorithm().id === "hill") {
    const size = Math.sqrt((els.keyInput.value.match(/-?\d+/g) || []).length);
    if ([2, 3].includes(size)) renderHillMatrixGrid(size, els.keyInput.value);
  }
  validateActiveKey();
  previewCalculationFlow();
});
els.generateRsaBtn.addEventListener("click", generateRsaKeys);
els.importRsaBtn.addEventListener("click", importRsaKeys);
els.rsaPublicKey.addEventListener("input", () => {
  if (selectedAlgorithm().id === "rsa") {
    syncDerivedRsaPrivateKey();
    validateActiveKey();
    previewCalculationFlow();
    updateRsaOutputMap(rsaCipherToCharacterEntries(els.outputText.value), "cipher number -> character");
  }
});
els.rsaPrivateKey.addEventListener("input", () => {
  if (selectedAlgorithm().id === "rsa") {
    validateActiveKey();
    previewCalculationFlow();
    updateRsaOutputMap(rsaCipherToCharacterEntries(els.outputText.value), "cipher number -> character");
  }
});
els.copyPublicKeyBtn.addEventListener("click", () => copyText(els.rsaPublicKey.value, "No public key to copy.", "Public key copied."));
els.copyPrivateKeyBtn.addEventListener("click", () => copyText(els.rsaPrivateKey.value, "No private key to copy.", "Private key copied."));
els.applyRsaParamsBtn.addEventListener("click", applyRsaParams);
els.hill2Btn.addEventListener("click", () => renderHillMatrixGrid(2, "2,3,3,6"));
els.hill3Btn.addEventListener("click", () => renderHillMatrixGrid(3, "17,17,5,21,18,21,2,2,19"));
els.fileEncryptBtn.addEventListener("click", () => processHillFile("encrypt"));
els.fileDecryptBtn.addEventListener("click", () => processHillFile("decrypt"));

els.copyBtn.addEventListener("click", () => copyText(els.outputText.value, "Nothing to copy yet.", "Output copied."));
els.downloadTextBtn.addEventListener("click", downloadOutputText);
els.saveOutputBtn.addEventListener("click", saveCurrentOutput);
els.clearOutputBtn.addEventListener("click", clearOutput);

els.clearBtn.addEventListener("click", () => {
  els.plainText.value = "";
  els.outputText.value = "";
  updateCharCount();
  validateActiveKey();
  updateRsaOutputMap("", "RSA decoded word");
  setMessage(els, "Cleared.");
});

if (els.clearHistoryBtn) {
  els.clearHistoryBtn.addEventListener("click", async () => {
    state.history = [];
    renderHistory(els, state.history);
    renderActivityChart(els, state.history);
    try {
      if (state.guest && state.databaseReady) {
        await apiRequest(`/api/generations?guestId=${encodeURIComponent(state.guest.id)}`, {
          method: "DELETE",
        });
      }
      setMessage(els, "History cleared.");
    } catch (error) {
      setMessage(els, error.message, "error");
    }
  });
}
