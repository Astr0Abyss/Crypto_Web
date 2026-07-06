import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

const root = resolve(".");
const envPath = join(root, ".env");

if (existsSync(envPath)) {
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (!process.env[key]) {
        process.env[key] = valueParts.join("=").replace(/^['"]|['"]$/g, "");
      }
    });
}

const port = Number(process.env.PORT || 5500);
let poolPromise;
let schemaReadyPromise;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const resolveRequestPath = (url) => {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const requestedPath = normalize(join(root, pathname === "/" ? "index.html" : pathname));

  if (!requestedPath.startsWith(root)) {
    return null;
  }

  if (existsSync(requestedPath) && statSync(requestedPath).isDirectory()) {
    return join(requestedPath, "index.html");
  }

  return requestedPath;
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
};

const readJsonBody = async (request) => {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const getPool = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured. Add your Neon connection string before using database sync.");
  }

  if (!poolPromise) {
    poolPromise = import("pg").then(({ Pool }) => new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
    }));
  }

  return poolPromise;
};

const ensureSchema = async () => {
  if (!schemaReadyPromise) {
    schemaReadyPromise = getPool().then((pool) => pool.query(`
      CREATE TABLE IF NOT EXISTS guest_users (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS app_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS auth_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS generations (
        id TEXT PRIMARY KEY,
        guest_id TEXT NOT NULL REFERENCES guest_users(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE,
        algorithm TEXT NOT NULL,
        mode TEXT NOT NULL CHECK (mode IN ('encrypt', 'decrypt')),
        input_text TEXT NOT NULL,
        output_text TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE generations
        ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE;

      ALTER TABLE generations
        ALTER COLUMN guest_id DROP NOT NULL;

      CREATE INDEX IF NOT EXISTS generations_guest_created_idx
        ON generations (guest_id, created_at DESC);

      CREATE INDEX IF NOT EXISTS generations_user_created_idx
        ON generations (user_id, created_at DESC);
    `));
  }

  return schemaReadyPromise;
};

const normalizeGuestId = (guestId) => {
  if (typeof guestId !== "string" || !/^[a-zA-Z0-9_-]{8,80}$/.test(guestId)) {
    return `guest_${randomUUID().replace(/-/g, "")}`;
  }

  return guestId;
};

const normalizeDisplayName = (displayName, guestId) => {
  if (typeof displayName === "string" && displayName.trim()) {
    return displayName.trim().slice(0, 48);
  }

  return `Guest ${guestId.slice(-6).toUpperCase()}`;
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  created_at: user.created_at,
});

const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, passwordHash) => {
  const [salt, savedHash] = String(passwordHash || "").split(":");
  if (!salt || !savedHash) return false;

  const saved = Buffer.from(savedHash, "hex");
  const candidate = scryptSync(password, salt, 64);
  return saved.length === candidate.length && timingSafeEqual(saved, candidate);
};

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

const createSession = async (userId) => {
  await ensureSchema();
  const pool = await getPool();
  const token = randomBytes(32).toString("hex");
  await pool.query(`
    INSERT INTO auth_sessions (id, user_id, token_hash)
    VALUES ($1, $2, $3);
  `, [randomUUID(), userId, hashToken(token)]);
  return token;
};

const getBearerToken = (request) => {
  const header = request.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
};

const getAuthUser = async (request) => {
  const token = getBearerToken(request);
  if (!token) return null;

  await ensureSchema();
  const pool = await getPool();
  const result = await pool.query(`
    SELECT u.id, u.name, u.email, u.created_at
    FROM auth_sessions s
    JOIN app_users u ON u.id = s.user_id
    WHERE s.token_hash = $1;
  `, [hashToken(token)]);

  if (!result.rows[0]) return null;

  await pool.query("UPDATE auth_sessions SET last_seen_at = NOW() WHERE token_hash = $1;", [hashToken(token)]);
  await pool.query("UPDATE app_users SET last_seen_at = NOW() WHERE id = $1;", [result.rows[0].id]);

  return result.rows[0];
};

const signUpUser = async ({ name, email, password }) => {
  await ensureSchema();
  const pool = await getPool();
  const cleanName = String(name || "").trim().slice(0, 80);
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || "");

  if (!cleanName) throw new Error("Enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("Enter a valid email address.");
  if (cleanPassword.length < 6) throw new Error("Password must be at least 6 characters.");

  try {
    const result = await pool.query(`
      INSERT INTO app_users (id, name, email, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, created_at;
    `, [randomUUID(), cleanName, cleanEmail, hashPassword(cleanPassword)]);

    const token = await createSession(result.rows[0].id);
    return { user: publicUser(result.rows[0]), token };
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("An account with this email already exists.");
    }
    throw error;
  }
};

const loginUser = async ({ email, password }) => {
  await ensureSchema();
  const pool = await getPool();
  const cleanEmail = normalizeEmail(email);
  const result = await pool.query(`
    SELECT id, name, email, password_hash, created_at
    FROM app_users
    WHERE email = $1;
  `, [cleanEmail]);
  const user = result.rows[0];

  if (!user || !verifyPassword(String(password || ""), user.password_hash)) {
    throw new Error("Email or password is incorrect.");
  }

  const token = await createSession(user.id);
  return { user: publicUser(user), token };
};

const logoutUser = async (request) => {
  const token = getBearerToken(request);
  if (!token) return;

  await ensureSchema();
  const pool = await getPool();
  await pool.query("DELETE FROM auth_sessions WHERE token_hash = $1;", [hashToken(token)]);
};

const upsertGuest = async ({ guestId, displayName }) => {
  await ensureSchema();
  const pool = await getPool();
  const id = normalizeGuestId(guestId);
  const name = normalizeDisplayName(displayName, id);

  const result = await pool.query(`
    INSERT INTO guest_users (id, display_name)
    VALUES ($1, $2)
    ON CONFLICT (id) DO UPDATE
      SET display_name = EXCLUDED.display_name,
          last_seen_at = NOW()
    RETURNING id, display_name, created_at, last_seen_at;
  `, [id, name]);

  return result.rows[0];
};

const listGenerations = async ({ guestId, userId }) => {
  await ensureSchema();
  const pool = await getPool();
  const result = userId
    ? await pool.query(`
      SELECT id, algorithm, mode, input_text, output_text, created_at
      FROM generations
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 25;
    `, [userId])
    : await pool.query(`
      SELECT id, algorithm, mode, input_text, output_text, created_at
      FROM generations
      WHERE guest_id = $1
      ORDER BY created_at DESC
      LIMIT 25;
    `, [guestId]);

  return result.rows;
};

const deleteGenerations = async ({ guestId, userId }) => {
  await ensureSchema();
  const pool = await getPool();
  if (userId) {
    await pool.query("DELETE FROM generations WHERE user_id = $1;", [userId]);
  } else {
    await pool.query("DELETE FROM generations WHERE guest_id = $1;", [guestId]);
  }
};

const saveGeneration = async ({ guestId, displayName, userId, algorithm, mode, inputText, outputText }) => {
  const guest = userId ? null : await upsertGuest({ guestId, displayName });
  const cleanAlgorithm = String(algorithm || "").trim().slice(0, 80);
  const cleanMode = mode === "decrypt" ? "decrypt" : "encrypt";
  const cleanInput = String(inputText || "").slice(0, 5000);
  const cleanOutput = String(outputText || "").slice(0, 10000);

  if (!cleanAlgorithm || !cleanInput || !cleanOutput) {
    throw new Error("Generation needs algorithm, input, and output.");
  }

  const pool = await getPool();
  const result = await pool.query(`
    INSERT INTO generations (id, guest_id, user_id, algorithm, mode, input_text, output_text)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, algorithm, mode, input_text, output_text, created_at;
  `, [randomUUID(), guest?.id || null, userId || null, cleanAlgorithm, cleanMode, cleanInput, cleanOutput]);

  return result.rows[0];
};

const handleApi = async (request, response, url) => {
  try {
    if (url.pathname === "/api/session" && request.method === "POST") {
      const body = await readJsonBody(request);
      const guest = await upsertGuest(body);
      sendJson(response, 200, { guest });
      return true;
    }

    if (url.pathname === "/api/auth/signup" && request.method === "POST") {
      const payload = await signUpUser(await readJsonBody(request));
      sendJson(response, 201, payload);
      return true;
    }

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const payload = await loginUser(await readJsonBody(request));
      sendJson(response, 200, payload);
      return true;
    }

    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      await logoutUser(request);
      sendJson(response, 200, { ok: true });
      return true;
    }

    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const user = await getAuthUser(request);
      sendJson(response, 200, { user: user ? publicUser(user) : null });
      return true;
    }

    if (url.pathname === "/api/generations" && request.method === "GET") {
      const user = await getAuthUser(request);
      const guestId = normalizeGuestId(url.searchParams.get("guestId"));
      const generations = await listGenerations({ guestId, userId: user?.id });
      sendJson(response, 200, { generations });
      return true;
    }

    if (url.pathname === "/api/generations" && request.method === "POST") {
      const user = await getAuthUser(request);
      const body = await readJsonBody(request);
      const generation = await saveGeneration({ ...body, userId: user?.id });
      sendJson(response, 201, { generation });
      return true;
    }

    if (url.pathname === "/api/generations" && request.method === "DELETE") {
      const user = await getAuthUser(request);
      const guestId = normalizeGuestId(url.searchParams.get("guestId"));
      await deleteGenerations({ guestId, userId: user?.id });
      sendJson(response, 200, { ok: true });
      return true;
    }

    if (url.pathname.startsWith("/api/")) {
      sendJson(response, 404, { error: "API route not found." });
      return true;
    }

    return false;
  } catch (error) {
    sendJson(response, 500, { error: error.message });
    return true;
  }
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);
  if (await handleApi(request, response, url)) {
    return;
  }

  const filePath = resolveRequestPath(request.url);

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Crypto Toolkit running at http://127.0.0.1:${port}/`);
});
