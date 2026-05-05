import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(".");
const port = Number(process.env.PORT || 5500);

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

const server = createServer((request, response) => {
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
