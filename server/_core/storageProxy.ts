import type { Express } from "express";
import { ENV } from "./env";
import { sdk } from "./sdk";
import path from "path";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    try {
      await sdk.authenticateRequest(req);
    } catch (authError) {
      res.status(401).send("Unauthorized: Authentication required");
      return;
    }

    const rawKey = (req.params as Record<string, string>)[0];
    if (!rawKey) {
      res.status(400).send("Missing storage key");
      return;
    }

    // ── SECURITY: Block path traversal attacks ──────────────
    // Normalize the key and reject anything that escapes the storage root
    const normalizedKey = path.normalize(rawKey).replace(/\\/g, "/");
    if (
      normalizedKey.includes("..") ||
      normalizedKey.startsWith("/") ||
      normalizedKey.includes("\0") ||
      normalizedKey.includes("%2e%2e") ||
      normalizedKey.includes("%00")
    ) {
      console.warn(`[StorageProxy] Path traversal attempt blocked: "${rawKey}"`);
      res.status(403).send("Forbidden: Invalid storage path");
      return;
    }

    // Only allow safe characters in storage keys
    if (!/^[\w\-./]+$/.test(normalizedKey)) {
      res.status(400).send("Invalid storage key format");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", normalizedKey);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
