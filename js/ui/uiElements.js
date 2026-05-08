export const renderAppShell = () => {
  document.querySelector("#app").innerHTML = `
    <main class="relative mx-auto flex min-h-screen max-w-[1500px] gap-4 p-2 sm:p-4 lg:gap-5 lg:p-8">
      <aside class="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-[84px] shrink-0 flex-col items-center justify-between rounded-3xl px-3 py-7 lg:flex">
        <div class="flex flex-col items-center gap-8">
          <div class="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-glow">
            <i data-lucide="shield-keyhole" class="h-6 w-6"></i>
          </div>
          <nav class="flex flex-col gap-4 text-slate-500">
            ${["layout-dashboard", "lock", "unlock-keyhole", "braces", "history"].map((icon, index) => `
              <a href="${index === 0 ? "#" : index < 3 ? "#tool" : index === 3 ? "#algorithms" : "#activity"}" class="grid h-12 w-12 place-items-center rounded-2xl ${index === 0 ? "bg-white/70 text-blue-600 shadow-sm" : ""} transition hover:-translate-y-0.5 hover:bg-white/70 hover:text-blue-600">
                <i data-lucide="${icon}" class="h-5 w-5"></i>
              </a>
            `).join("")}
          </nav>
        </div>
        <button class="grid h-12 w-12 place-items-center rounded-2xl text-slate-500 transition hover:bg-white/70 hover:text-blue-600" title="Settings">
          <i data-lucide="settings" class="h-5 w-5"></i>
        </button>
      </aside>

      <section class="glass min-w-0 flex-1 rounded-3xl p-3 shadow-glass sm:p-5 lg:rounded-[2rem] lg:p-8">
        <header class="mb-5 flex items-center justify-between gap-4 sm:mb-8">
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600/10 text-blue-600">
              <i data-lucide="shield-check" class="h-5 w-5"></i>
            </span>
            <h1 class="text-lg font-bold tracking-tight sm:text-xl">Crypto <span class="text-blue-600">Toolkit</span></h1>
          </div>
          <nav class="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#algorithms" class="transition hover:text-blue-600">Algorithms</a>
            <a href="#tool" class="transition hover:text-blue-600">Toolkit</a>
            <a href="#activity" class="transition hover:text-blue-600">History</a>
          </nav>
        </header>

        <nav class="glass-soft mb-5 grid grid-cols-5 gap-2 rounded-2xl p-2 text-slate-500 lg:hidden">
          ${["layout-dashboard", "lock", "unlock-keyhole", "braces", "history"].map((icon, index) => `
            <a href="${index === 0 ? "#" : index < 3 ? "#tool" : index === 3 ? "#algorithms" : "#activity"}" class="grid h-11 place-items-center rounded-xl ${index === 0 ? "bg-white/70 text-blue-600" : ""} transition hover:bg-white/70 hover:text-blue-600">
              <i data-lucide="${icon}" class="h-5 w-5"></i>
            </a>
          `).join("")}
        </nav>

        ${heroSection()}
        ${toolSection()}
        ${calculationFlowSection()}
        ${activitySection()}
      </section>
    </main>
  `;
};

const heroSection = () => `
  <section class="relative overflow-hidden rounded-3xl p-5 sm:p-8 lg:rounded-[2rem] lg:p-10">
    <div class="absolute inset-0 -z-10 bg-gradient-to-br from-white/70 via-blue-50/60 to-white/30"></div>
    <div class="grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">
          <i data-lucide="sparkles" class="h-3.5 w-3.5"></i>
          Advanced. Secure. Reliable.
        </div>
        <h2 class="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          <span class="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">Secure</span> Your Data
        </h2>
        <p class="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          Modular client-side encryption and decryption tools with visible, editable algorithm logic.
        </p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#tool" class="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5">
            Start Encrypting <i data-lucide="arrow-right" class="h-4 w-4"></i>
          </a>
          <a href="#algorithms" class="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:text-blue-600">
            <i data-lucide="sliders-horizontal" class="h-4 w-4"></i> Explore Algorithms
          </a>
        </div>
      </div>
      <div class="relative min-h-[220px] sm:min-h-[280px]">
        <div class="absolute inset-0 rounded-full bg-blue-400/10 blur-3xl"></div>
        ${wireframeKey()}
      </div>
    </div>
  </section>
`;

const calculationFlowSection = () => `
  <section id="calculation-flow" class="cyber-flow glass mt-6 overflow-hidden rounded-3xl p-5 sm:p-6">
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="cyber-badge mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200/70 bg-slate-950/90 px-3 py-1 text-xs font-bold text-cyan-200 shadow-glow">
          <i data-lucide="scan-line" class="h-3.5 w-3.5"></i>
          Cipher Trace
        </div>
        <h3 id="flowTitle" class="text-xl font-extrabold text-slate-950">Calculation Flow</h3>
        <p id="flowSubtitle" class="mt-1 text-sm text-slate-500">Select an algorithm or run encryption to inspect the process.</p>
      </div>
      <div class="rounded-2xl border border-cyan-200/70 bg-slate-950 px-4 py-3 font-mono text-xs font-bold text-cyan-200">
        <span class="text-cyan-400">mode:</span> <span id="flowMode">standby</span>
      </div>
    </div>
    <div class="cyber-lane mb-4 hidden h-2 overflow-hidden rounded-full bg-slate-950/90 lg:block">
      <span></span>
    </div>
    <div id="flowSteps" class="grid gap-3 lg:grid-cols-3"></div>
  </section>
`;

const wireframeKey = () => `
  <svg class="float-key relative mx-auto h-[220px] w-full max-w-[470px] sm:h-[280px]" viewBox="0 0 520 360" fill="none" aria-label="Polygon wireframe key illustration">
    <g opacity="0.18">
      <circle cx="60" cy="78" r="3" fill="#2563eb" />
      <circle cx="132" cy="44" r="3" fill="#2563eb" />
      <circle cx="222" cy="84" r="3" fill="#2563eb" />
      <circle cx="430" cy="56" r="3" fill="#2563eb" />
      <path d="M60 78 132 44 222 84 430 56M132 44l110 118M222 84l122 96M344 180l86-124" stroke="#2563eb" stroke-width="1" />
    </g>
    <g transform="translate(42 32) rotate(-12 238 156)">
      <path class="key-line" d="M308 90c-38-38-100-38-138 0-32 32-37 80-16 118L40 322l38 38 28-28 34 2 2-34 34 2 2-34 31-31c38 21 86 16 118-16 38-38 38-100 0-138Zm-42 94c-16 16-42 16-58 0s-16-42 0-58 42-16 58 0 16 42 0 58Z" stroke="#2563eb" stroke-width="3" fill="rgba(96,165,250,0.05)" />
      <path d="M174 95 266 184M154 208 78 284M188 226 106 332M210 236 142 300M141 177l186-44M171 84l154 146M128 232l80 6M210 70l30 112M279 79l-63 147M333 156l-170 30M88 310l92-34" stroke="#60a5fa" stroke-width="1.3" opacity="0.72" />
      <g fill="#2563eb">
        <circle cx="174" cy="95" r="4" /><circle cx="266" cy="184" r="4" /><circle cx="154" cy="208" r="4" />
        <circle cx="78" cy="284" r="4" /><circle cx="106" cy="332" r="4" /><circle cx="210" cy="236" r="4" />
        <circle cx="141" cy="177" r="4" /><circle cx="327" cy="133" r="4" /><circle cx="171" cy="84" r="4" />
        <circle cx="325" cy="230" r="4" /><circle cx="240" cy="182" r="4" /><circle cx="279" cy="79" r="4" />
        <circle cx="163" cy="186" r="4" /><circle cx="88" cy="310" r="4" /><circle cx="180" cy="276" r="4" />
      </g>
    </g>
  </svg>
`;

const toolSection = () => `
  <section id="tool" class="glass mt-6 rounded-3xl p-5 sm:p-6">
    <div class="grid gap-6 xl:grid-cols-2">
      <article>
        <div class="mb-5 flex items-center gap-3">
          <span class="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600/10 text-blue-600"><i data-lucide="lock" class="h-5 w-5"></i></span>
          <div><h3 class="text-xl font-extrabold">Encrypt</h3><p id="algorithmDescription" class="text-sm text-slate-500"></p></div>
        </div>
        <label class="text-sm font-bold text-slate-700" for="plainText">Your Text</label>
        <textarea id="plainText" class="field mt-2 min-h-44 p-4 text-sm leading-6" maxlength="5000" placeholder="Type or paste your text here..."></textarea>
        <div class="mt-2 flex justify-between text-xs text-slate-400"><span id="inputHint">Ready for input</span><span><span id="charCount">0</span> / 5000</span></div>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label class="text-sm font-bold text-slate-700" for="algorithmSelect">Algorithm</label>
            <select id="algorithmSelect" class="field mt-2 h-12 px-4 text-sm font-semibold"></select>
          </div>
          <div>
            <label id="keyLabel" class="text-sm font-bold text-slate-700" for="keyInput">Key / Shift</label>
            <input id="keyInput" class="field mt-2 h-12 px-4 text-sm" />
          </div>
        </div>
        ${rsaKeyPanel()}
        ${hillFilePanel()}
        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <button id="encryptBtn" class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5">
            <i data-lucide="lock-keyhole" class="h-4 w-4"></i> Encrypt
          </button>
          <button id="clearBtn" class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:text-blue-600">
            <i data-lucide="eraser" class="h-4 w-4"></i> Clear
          </button>
        </div>
      </article>
      <article class="xl:border-l xl:border-white/50 xl:pl-6">
        <div class="mb-5 flex items-center gap-3">
          <span class="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600/10 text-blue-600"><i data-lucide="unlock-keyhole" class="h-5 w-5"></i></span>
          <div><h3 class="text-xl font-extrabold">Decrypt</h3><p class="text-sm text-slate-500">Reverse the selected operation securely</p></div>
        </div>
        <label class="text-sm font-bold text-slate-700" for="outputText">Output Area</label>
        <textarea id="outputText" class="field mt-2 min-h-[19rem] p-4 font-mono text-sm leading-6" placeholder="Encrypted or decrypted output appears here..."></textarea>
        <p id="errorMessage" class="mt-3 min-h-5 text-sm font-semibold text-rose-600"></p>
        <p id="successMessage" class="min-h-5 text-sm font-semibold text-emerald-600"></p>
        <div class="mt-3 flex flex-col gap-3 sm:flex-row">
          <button id="decryptBtn" class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white/80 px-5 py-3 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50">
            <i data-lucide="repeat-2" class="h-4 w-4"></i> Decrypt
          </button>
          <button id="copyBtn" class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:text-blue-600">
            <i data-lucide="copy" class="h-4 w-4"></i> Copy
          </button>
        </div>
      </article>
    </div>
  </section>
`;

const hillFilePanel = () => `
  <div id="hillFilePanel" class="mt-4 hidden rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-6 text-slate-600">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="font-bold text-blue-700">Hill file mode</p>
        <p id="fileStatus">Upload a photo or PDF to encrypt/decrypt bytes with the Hill matrix key.</p>
      </div>
      <a id="fileDownloadLink" class="hidden rounded-xl bg-white/80 px-3 py-2 font-bold text-blue-700 transition hover:bg-blue-50" download>Download Result</a>
    </div>
    <div class="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
      <input id="fileInput" class="field px-3 py-3 text-sm" type="file" accept="image/*,.pdf,.hill,application/pdf,application/octet-stream" />
      <button id="fileEncryptBtn" class="rounded-xl bg-white/80 px-4 py-3 font-bold text-blue-700 transition hover:bg-blue-50">Encrypt File</button>
      <button id="fileDecryptBtn" class="rounded-xl bg-white/80 px-4 py-3 font-bold text-blue-700 transition hover:bg-blue-50">Decrypt File</button>
    </div>
    <p class="mt-3">Use a key whose determinant is invertible modulo 256. The default <code>3,3,2,5</code> works for images/PDF bytes.</p>
  </div>
`;

const rsaKeyPanel = () => `
  <div id="rsaPanel" class="mt-4 hidden rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-6 text-slate-600">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="font-bold text-blue-700">RSA key management</p>
        <p id="rsaStatus">Use auto sample keys or enter manual textbook RSA keys.</p>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:flex">
        <button id="generateRsaBtn" class="rounded-xl bg-white/80 px-3 py-2 font-bold text-blue-700 transition hover:bg-blue-50">Auto Fill</button>
        <button id="importRsaBtn" class="rounded-xl bg-white/80 px-3 py-2 font-bold text-blue-700 transition hover:bg-blue-50">Use Manual</button>
      </div>
    </div>
    <div class="mt-4 grid gap-3 lg:grid-cols-2">
      <div>
        <div class="mb-2 flex items-center justify-between gap-2">
          <label class="font-bold text-slate-700" for="rsaPublicKey">Public Key (n,e)</label>
          <button id="copyPublicKeyBtn" class="rounded-lg bg-white/80 px-2 py-1 font-bold text-blue-700">Copy</button>
        </div>
        <input id="rsaPublicKey" class="field h-12 px-3 font-mono text-sm" placeholder="Example: 391,3" />
      </div>
      <div>
        <div class="mb-2 flex items-center justify-between gap-2">
          <label class="font-bold text-slate-700" for="rsaPrivateKey">Private Key (n,d)</label>
          <button id="copyPrivateKeyBtn" class="rounded-lg bg-white/80 px-2 py-1 font-bold text-blue-700">Copy</button>
        </div>
        <input id="rsaPrivateKey" class="field h-12 px-3 font-mono text-sm" placeholder="Example: 391,235" />
      </div>
    </div>
    <p class="mt-3">Alphabet mapping: A=1, B=2, ... Z=26. Spaces map to 0. Encrypt: c = m^e mod n. Decrypt: m = c^d mod n.</p>
  </div>
`;

const activitySection = () => `
  <section id="activity" class="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
    <article class="glass rounded-3xl p-5 sm:p-6">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div><h3 class="text-lg font-extrabold">Encryption Activity</h3><p class="text-sm text-slate-500">Overview of recent encryption/decryption activity</p></div>
        <button class="rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold text-slate-600">This Month</button>
      </div>
      <svg class="h-56 w-full" viewBox="0 0 720 240" preserveAspectRatio="none" aria-label="Dummy encryption activity chart">
        <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18" /><stop offset="100%" stop-color="#3b82f6" stop-opacity="0" /></linearGradient></defs>
        <g stroke="#dbeafe" stroke-width="1"><path d="M0 52H720M0 100H720M0 148H720M0 196H720" /></g>
        <path d="M0 190 C60 112 92 82 150 92 S245 144 300 122 S395 96 450 137 S548 78 610 105 S675 142 720 86 L720 240 L0 240 Z" fill="url(#chartFill)" />
        <path class="chart-line" d="M0 190 C60 112 92 82 150 92 S245 144 300 122 S395 96 450 137 S548 78 610 105 S675 142 720 86" fill="none" stroke="#3b82f6" stroke-width="3" />
        <path class="chart-line" d="M0 206 C68 150 104 125 162 134 S256 168 320 154 S408 132 470 162 S566 118 620 139 S680 168 720 142" fill="none" stroke="#8b5cf6" stroke-width="2.5" opacity="0.82" />
      </svg>
    </article>
    <article id="algorithms" class="glass rounded-3xl p-5 sm:p-6">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div><h3 class="text-lg font-extrabold">Recent Operations</h3><p class="text-sm text-slate-500">Local UI history for this session</p></div>
        <button id="clearHistoryBtn" class="rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold text-slate-600 transition hover:text-blue-600">Clear</button>
      </div>
      <div id="historyList" class="space-y-3"></div>
    </article>
  </section>
`;

export const getElements = () => ({
  plainText: document.querySelector("#plainText"),
  outputText: document.querySelector("#outputText"),
  algorithmSelect: document.querySelector("#algorithmSelect"),
  algorithmDescription: document.querySelector("#algorithmDescription"),
  keyInput: document.querySelector("#keyInput"),
  keyLabel: document.querySelector("#keyLabel"),
  encryptBtn: document.querySelector("#encryptBtn"),
  decryptBtn: document.querySelector("#decryptBtn"),
  copyBtn: document.querySelector("#copyBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  clearHistoryBtn: document.querySelector("#clearHistoryBtn"),
  errorMessage: document.querySelector("#errorMessage"),
  successMessage: document.querySelector("#successMessage"),
  charCount: document.querySelector("#charCount"),
  inputHint: document.querySelector("#inputHint"),
  historyList: document.querySelector("#historyList"),
  rsaPanel: document.querySelector("#rsaPanel"),
  rsaStatus: document.querySelector("#rsaStatus"),
  generateRsaBtn: document.querySelector("#generateRsaBtn"),
  importRsaBtn: document.querySelector("#importRsaBtn"),
  rsaPublicKey: document.querySelector("#rsaPublicKey"),
  rsaPrivateKey: document.querySelector("#rsaPrivateKey"),
  copyPublicKeyBtn: document.querySelector("#copyPublicKeyBtn"),
  copyPrivateKeyBtn: document.querySelector("#copyPrivateKeyBtn"),
  hillFilePanel: document.querySelector("#hillFilePanel"),
  fileInput: document.querySelector("#fileInput"),
  fileEncryptBtn: document.querySelector("#fileEncryptBtn"),
  fileDecryptBtn: document.querySelector("#fileDecryptBtn"),
  fileStatus: document.querySelector("#fileStatus"),
  fileDownloadLink: document.querySelector("#fileDownloadLink"),
  flowTitle: document.querySelector("#flowTitle"),
  flowSubtitle: document.querySelector("#flowSubtitle"),
  flowMode: document.querySelector("#flowMode"),
  flowSteps: document.querySelector("#flowSteps"),
});

export const populateAlgorithmOptions = (select, algorithms) => {
  select.innerHTML = Object.values(algorithms)
    .map((algorithm) => `<option value="${algorithm.id}">${algorithm.label}</option>`)
    .join("");
};

export const setMessage = (els, message = "", type = "success") => {
  els.errorMessage.textContent = type === "error" ? message : "";
  els.successMessage.textContent = type === "success" ? message : "";
};

export const setBusy = (els, busy) => {
  [els.encryptBtn, els.decryptBtn, els.generateRsaBtn, els.importRsaBtn, els.fileEncryptBtn, els.fileDecryptBtn].forEach((button) => {
    if (!button) return;
    button.disabled = busy;
    button.classList.toggle("opacity-60", busy);
    button.classList.toggle("cursor-wait", busy);
  });
};

export const renderHistory = (els, history) => {
  if (!els.historyList) return;

  if (!history.length) {
    els.historyList.innerHTML = '<div class="glass-soft rounded-2xl p-4 text-sm text-slate-600">No operations yet. Encrypt or decrypt something to start the trail.</div>';
    return;
  }

  els.historyList.innerHTML = history.map((item) => `
    <div class="glass-soft flex items-center gap-3 rounded-2xl p-4">
      <span class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${item.type === "Encrypted" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}">
        <i data-lucide="${item.type === "Encrypted" ? "lock" : "unlock-keyhole"}" class="h-4 w-4"></i>
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-slate-800">${item.type} using ${item.algorithm}</p>
        <p class="truncate text-xs text-slate-500">${item.preview}</p>
      </div>
      <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">${item.time}</span>
    </div>
  `).join("");
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

export const renderCalculationFlow = (els, { algorithm, mode = "standby", steps = [] }) => {
  els.flowTitle.textContent = `${algorithm.label} Calculation Flow`;
  els.flowSubtitle.textContent = algorithm.description;
  els.flowMode.textContent = mode;
  els.flowSteps.innerHTML = steps.map((step, index) => `
    <article class="flow-card relative overflow-hidden rounded-2xl border border-cyan-100/70 bg-white/65 p-4 shadow-sm backdrop-blur-lg" style="--flow-delay: ${index * 160}ms">
      <div class="absolute right-3 top-3 font-mono text-4xl font-black text-blue-100">0${index + 1}</div>
      <div class="relative">
        <p class="mb-2 inline-flex rounded-full bg-slate-950 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-cyan-200">${escapeHtml(step.label)}</p>
        <h4 class="text-sm font-extrabold text-slate-900">${escapeHtml(step.title)}</h4>
        <p class="mt-2 text-xs leading-5 text-slate-600">${escapeHtml(step.detail)}</p>
        <pre class="mt-3 overflow-auto rounded-xl bg-slate-950 p-3 text-[11px] leading-5 text-cyan-100">${escapeHtml(step.formula)}</pre>
      </div>
    </article>
  `).join("");
};
