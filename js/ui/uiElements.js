export const renderAppShell = () => {
  document.querySelector("#app").innerHTML = `
    ${authPageSection()}
    <main id="dashboardView" class="relative mx-auto flex min-h-screen max-w-[1500px] gap-4 p-2 sm:p-4 lg:gap-5 lg:p-8">
      <aside class="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-[84px] shrink-0 flex-col items-center justify-between rounded-3xl px-3 py-7 lg:flex">
        <div class="flex flex-col items-center gap-8">
          <div class="brand-logo grid h-14 w-14 place-items-center rounded-2xl text-white shadow-glow">
            <svg viewBox="0 0 64 64" class="h-10 w-10" fill="none" aria-label="Crypto Toolkit logo">
              <path d="M32 6 51 13v15c0 13.5-7.6 23.5-19 30-11.4-6.5-19-16.5-19-30V13L32 6Z" fill="url(#logoShield)" />
              <path d="M24 31v-5a8 8 0 0 1 16 0v5" stroke="white" stroke-width="4" stroke-linecap="round" />
              <rect x="20" y="29" width="24" height="18" rx="5" fill="white" fill-opacity=".92" />
              <path d="M32 35v6" stroke="#2563eb" stroke-width="4" stroke-linecap="round" />
              <circle cx="32" cy="35" r="3" fill="#2563eb" />
              <defs>
                <linearGradient id="logoShield" x1="13" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#2563eb" />
                  <stop offset="1" stop-color="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
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
          <div class="flex items-center gap-3">
            <div id="guestBadge" class="hidden items-center gap-2 rounded-2xl border border-blue-100 bg-white/70 px-3 py-2 text-xs font-bold text-blue-700 sm:inline-flex">
              <i data-lucide="user-round-check" class="h-4 w-4"></i>
              <span>Guest</span>
            </div>
            <a id="accountLink" href="#signin" class="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-3 py-2 text-xs font-bold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-blue-700">
              <i data-lucide="user-round" class="h-4 w-4"></i>
              <span>Sign In</span>
            </a>
            <nav class="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
              <a href="#algorithms" class="transition hover:text-blue-600">Algorithms</a>
              <a href="#tool" class="transition hover:text-blue-600">Toolkit</a>
              <a href="#activity" class="transition hover:text-blue-600">History</a>
            </nav>
          </div>
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

const authPageSection = () => `
  <section id="authPage" class="hidden min-h-screen p-4 sm:p-6 lg:p-10">
    <div class="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[560px] items-center justify-center sm:min-h-[calc(100vh-3rem)]">
      <div class="glass w-full rounded-3xl p-5 shadow-glass sm:p-8">
        <a href="#dashboard" class="mb-6 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white/70 px-3 py-2 text-xs font-bold text-blue-700 transition hover:text-blue-900">
          <i data-lucide="arrow-left" class="h-4 w-4"></i>
          Dashboard
        </a>
        <div class="mb-6">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-700">
            <i data-lucide="shield-check" class="h-3.5 w-3.5"></i>
            Crypto Toolkit
          </div>
          <h2 id="accountTitle" class="text-2xl font-extrabold tracking-tight text-slate-950">Sign in</h2>
          <p id="accountStatus" class="mt-2 text-sm leading-6 text-slate-500">Save generations to your account, or continue from the dashboard as a guest.</p>
        </div>
        <form id="loginForm" class="grid gap-3">
          <input id="loginEmail" class="field h-12 px-4 text-sm" autocomplete="email" placeholder="Email" type="email" />
          <input id="loginPassword" class="field h-12 px-4 text-sm" autocomplete="current-password" placeholder="Password" type="password" />
          <button id="loginBtn" class="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5">
            <i data-lucide="log-in" class="h-4 w-4"></i> Login
          </button>
        </form>
        <form id="signupForm" class="hidden grid gap-3">
          <input id="signupName" class="field h-12 px-4 text-sm" autocomplete="name" placeholder="Name" />
          <input id="signupEmail" class="field h-12 px-4 text-sm" autocomplete="email" placeholder="Email" type="email" />
          <input id="signupPassword" class="field h-12 px-4 text-sm" autocomplete="new-password" placeholder="Password" type="password" />
          <button id="signupBtn" class="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5">
            <i data-lucide="user-plus" class="h-4 w-4"></i> Create Account
          </button>
        </form>
        <div class="mt-5 flex flex-col items-center gap-3 text-sm text-slate-500">
          <button id="showSignupBtn" class="font-bold text-blue-700 transition hover:text-blue-900">Don't have an account? Sign up</button>
          <button id="showLoginBtn" class="hidden font-bold text-blue-700 transition hover:text-blue-900">Already have an account? Login</button>
          <button id="logoutBtn" class="hidden rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold text-slate-600 transition hover:text-blue-600">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </section>
`;

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
    <div id="binaryRain" class="binary-rain" aria-hidden="true"></div>
    <div id="binarySweep" class="binary-sweep" aria-hidden="true"></div>
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
    <div class="trace-layout">
      <div class="transform-preview rounded-2xl border border-cyan-200/50 bg-white/58 p-4 backdrop-blur-xl">
        <div class="mb-4 flex items-center justify-between gap-3">
          <span class="rounded-full bg-slate-950 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-cyan-200">live transform</span>
          <span id="transformStatus" class="font-mono text-xs font-bold text-cyan-700">listening...</span>
        </div>
        <div id="transformPreview" class="space-y-3"></div>
      </div>
      <div id="flowSteps" class="flow-steps-grid grid gap-3 lg:grid-cols-3"></div>
      <div class="binary-console rounded-2xl border border-cyan-200/40 bg-slate-950/95 p-4 font-mono text-[11px] leading-5 text-cyan-100">
        <div class="mb-3 flex items-center justify-between gap-3 text-cyan-300">
          <span class="font-bold">live binary stream</span>
          <span id="binaryStatus" class="text-cyan-500">listening...</span>
        </div>
        <div id="binaryStream" class="binary-stream"></div>
      </div>
    </div>
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
            <p id="keyStatus" class="mt-2 min-h-5 text-xs font-bold text-slate-500">Key ready</p>
          </div>
        </div>
        ${rsaKeyPanel()}
        ${hillFilePanel()}
        <div class="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div class="glass-soft grid grid-cols-2 rounded-2xl p-1">
            <button id="encryptModeBtn" class="mode-toggle mode-toggle-active rounded-xl px-4 py-3 text-sm font-bold transition" type="button">
              <i data-lucide="lock-keyhole" class="mr-1 inline h-4 w-4"></i> Encrypt
            </button>
            <button id="decryptModeBtn" class="mode-toggle rounded-xl px-4 py-3 text-sm font-bold transition" type="button">
              <i data-lucide="unlock-keyhole" class="mr-1 inline h-4 w-4"></i> Decrypt
            </button>
          </div>
          <label id="autoDetectWrap" class="hidden items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50/90 px-4 py-3 text-xs font-bold text-cyan-800 shadow-sm" title="For RSA, switch to decrypt when the input looks like spaced numbers.">
            <input id="autoDetectToggle" type="checkbox" class="h-4 w-4 accent-blue-600" checked />
            Auto RSA
          </label>
          <button id="runBtn" class="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5">
            <i id="runIcon" data-lucide="play" class="h-4 w-4"></i> <span id="runLabel">Run</span>
          </button>
        </div>
        <div class="mt-3 flex flex-col gap-3 sm:flex-row">
          <button id="swapBtn" class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white/80 px-5 py-3 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50">
            <i data-lucide="refresh-cw" class="h-4 w-4"></i> Swap To Decrypt
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
        <div id="rsaOutputMap" class="rsa-output-map mt-3 hidden rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <div class="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-extrabold text-slate-900">Output as Character</p>
            <span id="rsaOutputMode" class="font-mono text-xs font-bold text-blue-700">RSA decoded word</span>
          </div>
          <div id="rsaOutputMapList" class="mapping-row"></div>
        </div>
        <p id="errorMessage" class="mt-3 min-h-5 text-sm font-semibold text-rose-600"></p>
        <p id="successMessage" class="min-h-5 text-sm font-semibold text-emerald-600"></p>
        <div class="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button id="copyBtn" class="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/90 px-4 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100">
            <i data-lucide="copy" class="h-4 w-4"></i> Copy
          </button>
          <button id="downloadTextBtn" class="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/90 px-4 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100">
            <i data-lucide="download" class="h-4 w-4"></i> Download
          </button>
          <button id="saveOutputBtn" class="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/90 px-4 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100">
            <i data-lucide="bookmark-plus" class="h-4 w-4"></i> Save
          </button>
          <button id="clearOutputBtn" class="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-white/90 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50 hover:text-rose-600">
            <i data-lucide="x" class="h-4 w-4"></i> Clear
          </button>
        </div>
      </article>
    </div>
  </section>
`;

const hillFilePanel = () => `
  <div id="hillFilePanel" class="mt-4 hidden rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-6 text-slate-600">
    <div class="mb-4">
      <p class="font-bold text-blue-700">Hill matrix</p>
      <p>Enter 2x2 or 3x3 values. Examples: <code>2,3,3,6</code> or <code>17,17,5,21,18,21,2,2,19</code>.</p>
      <div id="hillMatrixGrid" class="mt-3 grid max-w-xl grid-cols-3 gap-2"></div>
      <div class="mt-3 flex flex-wrap gap-2">
        <button id="hill2Btn" class="rounded-xl bg-white/80 px-3 py-2 font-bold text-blue-700 transition hover:bg-blue-50">2x2</button>
        <button id="hill3Btn" class="rounded-xl bg-white/80 px-3 py-2 font-bold text-blue-700 transition hover:bg-blue-50">3x3</button>
      </div>
    </div>
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
        <input id="rsaPublicKey" class="field h-12 px-3 font-mono text-sm" placeholder="Example: 1147,7" />
      </div>
      <div>
        <div class="mb-2 flex items-center justify-between gap-2">
          <label class="font-bold text-slate-700" for="rsaPrivateKey">Private Key (n,d)</label>
          <button id="copyPrivateKeyBtn" class="rounded-lg bg-white/80 px-2 py-1 font-bold text-blue-700">Copy</button>
        </div>
        <input id="rsaPrivateKey" class="field h-12 px-3 font-mono text-sm" placeholder="Example: 1147,463" />
      </div>
    </div>
    <div class="mt-4 grid gap-3 sm:grid-cols-5">
      <input id="rsaPInput" class="field h-11 px-3 font-mono text-sm" placeholder="p" value="5" />
      <input id="rsaQInput" class="field h-11 px-3 font-mono text-sm" placeholder="q" value="17" />
      <input id="rsaEInput" class="field h-11 px-3 font-mono text-sm" placeholder="e" value="13" />
      <input id="rsaDInput" class="field h-11 px-3 font-mono text-sm" placeholder="d" value="5" />
      <button id="applyRsaParamsBtn" class="rounded-xl bg-white/80 px-3 py-2 font-bold text-blue-700 transition hover:bg-blue-50">Apply</button>
    </div>
    <p class="mt-3">Course mapping: A=0, B=1, ... Z=25. Apply p, q, e, d to load matching test-case keys.</p>
  </div>
`;

const activitySection = () => `
  <section id="activity" class="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
    <article class="activity-card glass rounded-3xl p-5 sm:p-6">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div><h3 class="text-lg font-extrabold">Encryption Activity</h3><p class="text-sm text-slate-500">Overview of recent encryption/decryption activity</p></div>
        <button class="rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold text-slate-600">This Month</button>
      </div>
      <svg class="activity-chart w-full" viewBox="0 0 720 240" preserveAspectRatio="none" aria-label="Encryption activity chart">
        <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.16" /><stop offset="72%" stop-color="#3b82f6" stop-opacity="0.07" /><stop offset="100%" stop-color="#3b82f6" stop-opacity="0" /></linearGradient></defs>
        <g stroke="#dbeafe" stroke-width="1"><path d="M0 52H720M0 100H720M0 148H720M0 196H720" /></g>
        <path id="activityFill" d="" fill="url(#chartFill)" />
        <path id="encryptLine" class="chart-line chart-line-blue chart-line-live" d="" fill="none" stroke="#3b82f6" stroke-width="3" />
        <path id="decryptLine" class="chart-line chart-line-purple chart-line-live" d="" fill="none" stroke="#8b5cf6" stroke-width="2.5" opacity="0.82" />
        <g id="activityDots"></g>
      </svg>
    </article>
    <article id="algorithms" class="glass rounded-3xl p-5 sm:p-6">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div><h3 class="text-lg font-extrabold">Recent Operations</h3><p id="syncStatus" class="text-sm text-slate-500">Preparing guest session</p></div>
        <button id="clearHistoryBtn" class="rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold text-slate-600 transition hover:text-blue-600">Clear</button>
      </div>
      <div id="historyList" class="space-y-3"></div>
    </article>
  </section>
`;

export const getElements = () => ({
  authPage: document.querySelector("#authPage"),
  dashboardView: document.querySelector("#dashboardView"),
  plainText: document.querySelector("#plainText"),
  outputText: document.querySelector("#outputText"),
  rsaOutputMap: document.querySelector("#rsaOutputMap"),
  rsaOutputMode: document.querySelector("#rsaOutputMode"),
  rsaOutputMapList: document.querySelector("#rsaOutputMapList"),
  algorithmSelect: document.querySelector("#algorithmSelect"),
  algorithmDescription: document.querySelector("#algorithmDescription"),
  guestBadge: document.querySelector("#guestBadge"),
  accountLink: document.querySelector("#accountLink"),
  accountTitle: document.querySelector("#accountTitle"),
  accountStatus: document.querySelector("#accountStatus"),
  signupForm: document.querySelector("#signupForm"),
  signupName: document.querySelector("#signupName"),
  signupEmail: document.querySelector("#signupEmail"),
  signupPassword: document.querySelector("#signupPassword"),
  signupBtn: document.querySelector("#signupBtn"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  loginBtn: document.querySelector("#loginBtn"),
  showSignupBtn: document.querySelector("#showSignupBtn"),
  showLoginBtn: document.querySelector("#showLoginBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  syncStatus: document.querySelector("#syncStatus"),
  keyInput: document.querySelector("#keyInput"),
  keyStatus: document.querySelector("#keyStatus"),
  keyLabel: document.querySelector("#keyLabel"),
  encryptModeBtn: document.querySelector("#encryptModeBtn"),
  decryptModeBtn: document.querySelector("#decryptModeBtn"),
  autoDetectWrap: document.querySelector("#autoDetectWrap"),
  autoDetectToggle: document.querySelector("#autoDetectToggle"),
  runBtn: document.querySelector("#runBtn"),
  runIcon: document.querySelector("#runIcon"),
  runLabel: document.querySelector("#runLabel"),
  swapBtn: document.querySelector("#swapBtn"),
  copyBtn: document.querySelector("#copyBtn"),
  downloadTextBtn: document.querySelector("#downloadTextBtn"),
  saveOutputBtn: document.querySelector("#saveOutputBtn"),
  clearOutputBtn: document.querySelector("#clearOutputBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  clearHistoryBtn: document.querySelector("#clearHistoryBtn"),
  errorMessage: document.querySelector("#errorMessage"),
  successMessage: document.querySelector("#successMessage"),
  charCount: document.querySelector("#charCount"),
  inputHint: document.querySelector("#inputHint"),
  historyList: document.querySelector("#historyList"),
  activityFill: document.querySelector("#activityFill"),
  encryptLine: document.querySelector("#encryptLine"),
  decryptLine: document.querySelector("#decryptLine"),
  activityDots: document.querySelector("#activityDots"),
  rsaPanel: document.querySelector("#rsaPanel"),
  rsaStatus: document.querySelector("#rsaStatus"),
  generateRsaBtn: document.querySelector("#generateRsaBtn"),
  importRsaBtn: document.querySelector("#importRsaBtn"),
  rsaPublicKey: document.querySelector("#rsaPublicKey"),
  rsaPrivateKey: document.querySelector("#rsaPrivateKey"),
  rsaPInput: document.querySelector("#rsaPInput"),
  rsaQInput: document.querySelector("#rsaQInput"),
  rsaEInput: document.querySelector("#rsaEInput"),
  rsaDInput: document.querySelector("#rsaDInput"),
  applyRsaParamsBtn: document.querySelector("#applyRsaParamsBtn"),
  copyPublicKeyBtn: document.querySelector("#copyPublicKeyBtn"),
  copyPrivateKeyBtn: document.querySelector("#copyPrivateKeyBtn"),
  hillFilePanel: document.querySelector("#hillFilePanel"),
  hillMatrixGrid: document.querySelector("#hillMatrixGrid"),
  hill2Btn: document.querySelector("#hill2Btn"),
  hill3Btn: document.querySelector("#hill3Btn"),
  fileInput: document.querySelector("#fileInput"),
  fileEncryptBtn: document.querySelector("#fileEncryptBtn"),
  fileDecryptBtn: document.querySelector("#fileDecryptBtn"),
  fileStatus: document.querySelector("#fileStatus"),
  fileDownloadLink: document.querySelector("#fileDownloadLink"),
  flowTitle: document.querySelector("#flowTitle"),
  flowSubtitle: document.querySelector("#flowSubtitle"),
  flowMode: document.querySelector("#flowMode"),
  flowSteps: document.querySelector("#flowSteps"),
  binaryRain: document.querySelector("#binaryRain"),
  binarySweep: document.querySelector("#binarySweep"),
  transformPreview: document.querySelector("#transformPreview"),
  transformStatus: document.querySelector("#transformStatus"),
  binaryStream: document.querySelector("#binaryStream"),
  binaryStatus: document.querySelector("#binaryStatus"),
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
  [els.runBtn, els.swapBtn, els.generateRsaBtn, els.importRsaBtn, els.fileEncryptBtn, els.fileDecryptBtn, els.signupBtn, els.loginBtn, els.logoutBtn, els.downloadTextBtn, els.saveOutputBtn, els.applyRsaParamsBtn].forEach((button) => {
    if (!button) return;
    button.disabled = busy;
    button.classList.toggle("opacity-60", busy);
    button.classList.toggle("cursor-wait", busy);
  });
};

export const renderRsaOutputMap = (els, text = "", mode = "mapping") => {
  if (!els.rsaOutputMap || !els.rsaOutputMapList) return;

  const entries = Array.isArray(text)
    ? text
    : [...text.toUpperCase()]
      .filter((char) => char === " " || (char >= "A" && char <= "Z"))
      .map((char) => `${char === " " ? "space" : char}`);

  els.rsaOutputMode.textContent = mode;
  els.rsaOutputMapList.innerHTML = entries.length
    ? entries.map((entry) => `<span>${escapeHtml(entry)}</span>`).join("")
    : "<span>Encrypt or decrypt RSA text to see the number-character map</span>";
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

const baseActivityPaths = {
  fill: "M0 198 C62 124 100 82 158 94 S252 146 306 124 S398 96 456 137 S550 78 610 108 S675 146 720 84 L720 240 L0 240 Z",
  encrypted: "M0 196 C58 124 96 82 154 92 S250 145 306 124 S398 96 456 137",
  decrypted: "M0 210 C68 152 106 126 166 136 S260 168 324 154 S410 132 470 162",
};

const activityExtension = (history, type) => {
  const count = history.filter((item) => item.type === type).length;
  const capped = Math.min(count, 3);

  if (!capped) return "";

  const start = type === "Encrypted"
    ? { x: 456, y: 137 }
    : { x: 470, y: 162 };
  const wave = type === "Encrypted"
    ? [
        [492, 126, 516, 108, 548, 118],
        [580, 130, 602, 94, 632, 102],
        [658, 110, 680, 130, 704, 92],
      ]
    : [
        [506, 154, 528, 142, 558, 150],
        [588, 160, 610, 132, 642, 140],
        [666, 146, 688, 164, 704, 150],
      ];

  return wave.slice(0, capped)
    .map(([cx1, cy1, cx2, cy2, x, y], index) => `C${index ? cx1 : (start.x + cx1) / 2} ${index ? cy1 : start.y} ${cx2} ${cy2} ${x} ${y}`)
    .join(" ");
};

export const renderActivityChart = (els, history) => {
  if (!els.encryptLine || !els.decryptLine || !els.activityFill || !els.activityDots) return;

  const encryptPath = `${baseActivityPaths.encrypted} ${activityExtension(history, "Encrypted")}`.trim();
  const decryptPath = `${baseActivityPaths.decrypted} ${activityExtension(history, "Decrypted")}`.trim();
  const latestEncrypted = history[0]?.type === "Encrypted";

  els.activityFill.setAttribute("d", baseActivityPaths.fill);
  els.encryptLine.setAttribute("d", encryptPath);
  els.decryptLine.setAttribute("d", decryptPath);
  els.encryptLine.classList.toggle("chart-line-active", latestEncrypted && history.length > 0);
  els.decryptLine.classList.toggle("chart-line-active", !latestEncrypted && history.length > 0);
  els.activityDots.innerHTML = "";

  [els.encryptLine, els.decryptLine].forEach((line) => {
    line.classList.remove("chart-line-live");
    void line.getBoundingClientRect();
    line.classList.add("chart-line-live");
  });
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const binaryFromText = (value) => {
  const source = value || "CRYPTO";
  return [...source].slice(0, 44)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
};

const renderBinaryChips = (value) => {
  return binaryFromText(value)
    .split(" ")
    .slice(0, 42)
    .map((byte, index) => `<span style="--chip-delay: ${index * 34}ms">${byte}</span>`)
    .join("");
};

const buildBinaryRain = (seed) => {
  const binary = binaryFromText(seed).replace(/\s/g, "") || "01010101";
  return Array.from({ length: 18 }, (_, column) => {
    const chars = Array.from({ length: 18 }, (_, row) => binary[(column * 7 + row * 3) % binary.length]).join("");
    return `<span style="--column: ${column}; --rain-delay: ${-(column % 9) * 0.42}s; --rain-speed: ${3.4 + (column % 5) * 0.34}s">${chars}</span>`;
  }).join("");
};

const buildBinarySweep = (seed) => {
  const binary = binaryFromText(seed).replace(/\s/g, "") || "01010101";
  return Array.from({ length: 7 }, (_, row) => {
    const sequence = Array.from({ length: 96 }, (_, index) => binary[(row * 11 + index * 5) % binary.length]).join("");
    return `<span style="--sweep-row: ${row}; --sweep-delay: ${row * -0.34}s">${sequence}</span>`;
  }).join("");
};

const renderTransformPreview = ({ input = "", key = "", result = "", pairs = [] }) => {
  const keyText = key || "No key";
  const visiblePairs = pairs.slice(0, 6);

  return `
    <div class="grid gap-3 sm:grid-cols-2">
      <div>
        <p class="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">key</p>
        <div class="preview-box">${escapeHtml(keyText)}</div>
      </div>
      <div>
        <p class="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">mode</p>
        <div class="preview-box">${escapeHtml(pairs.length ? "character mapping" : "watching")}</div>
      </div>
    </div>
    <div>
      <p class="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">sample mappings</p>
      <div class="mapping-row">
        ${visiblePairs.length ? visiblePairs.map((pair) => `<span>${escapeHtml(pair)}</span>`).join("") : "<span>type text to trace</span>"}
      </div>
    </div>
  `;
};

export const renderCalculationFlow = (els, { algorithm, mode = "standby", steps = [], binarySeed = "", preview = {} }) => {
  if (!els.flowTitle || !els.flowSteps) return;

  els.flowTitle.textContent = `${algorithm.label} Calculation Flow`;
  els.flowSubtitle.textContent = algorithm.description;
  els.flowMode.textContent = mode;
  const statusText = mode.includes("live") ? "streaming input" : mode;
  els.transformStatus.textContent = statusText;
  els.binaryStatus.textContent = statusText;
  els.transformPreview.innerHTML = renderTransformPreview(preview);
  els.binaryStream.innerHTML = renderBinaryChips(binarySeed);
  els.binaryRain.innerHTML = buildBinaryRain(binarySeed);
  els.binarySweep.innerHTML = buildBinarySweep(binarySeed);
  els.flowSteps.innerHTML = steps.map((step, index) => `
    <article class="flow-card relative overflow-hidden rounded-2xl border border-cyan-100/70 bg-white/65 p-4 shadow-sm backdrop-blur-lg" style="--flow-delay: ${index * 160}ms">
      <div class="absolute right-3 top-3 font-mono text-4xl font-black text-blue-100">0${index + 1}</div>
      <div class="relative">
        <p class="mb-2 inline-flex rounded-full bg-slate-950 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-cyan-200">${escapeHtml(step.label)}</p>
        <h4 class="text-sm font-extrabold text-slate-900">${escapeHtml(step.title)}</h4>
        <p class="mt-2 text-xs leading-5 text-slate-600">${escapeHtml(step.detail)}</p>
        <pre class="mt-3 overflow-hidden rounded-xl bg-slate-950 p-3 text-[11px] leading-5 text-cyan-100">${escapeHtml(step.formula)}</pre>
      </div>
    </article>
  `).join("");
};
