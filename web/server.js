import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const PORT = process.env.PORT || 3000;
const DIR = join(import.meta.dirname, "build");

const MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".wasm": "application/wasm",
};

const tryFile = async (filePath) => {
    try {
        const s = await stat(filePath);
        if (s.isFile()) return await readFile(filePath);
    } catch {}
    return null;
};

const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let filePath = join(DIR, url.pathname);

    let content = await tryFile(filePath);
    if (!content) content = await tryFile(join(filePath, "index.html"));
    if (!content) content = await tryFile(join(DIR, "index.html"));

    if (!content) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
    }

    const ext = extname(filePath) || ".html";
    const mime = MIME_TYPES[ext] || "application/octet-stream";

    const headers = { "Content-Type": mime };
    if (ext !== ".html") {
        headers["Cache-Control"] = "public, max-age=31536000, immutable";
    }

    res.writeHead(200, headers);
    res.end(content);
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`cobalt web serving on 0.0.0.0:${PORT}`);
});
