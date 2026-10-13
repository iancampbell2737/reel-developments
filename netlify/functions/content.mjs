import { getStore } from "@netlify/blobs";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const passcode = () => process.env.EDIT_PASSCODE || "173273";

export default async (req) => {
  const store = getStore("rhi-content");
  const url = new URL(req.url);

  if (req.method === "GET") {
    const ph = url.searchParams.get("photo");
    if (ph !== null) {
      if (!/^\d{1,2}$/.test(ph)) return new Response("Not found", { status: 404 });
      const r = await store.getWithMetadata("photo-" + ph, { type: "arrayBuffer" });
      if (!r) return new Response("Not found", { status: 404 });
      return new Response(r.data, {
        headers: {
          "content-type": (r.metadata && r.metadata.type) || "image/jpeg",
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    }
    const content = (await store.get("content", { type: "json" })) || { pages: {}, photos: null };
    return json(content);
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }

  if (body.passcode !== passcode()) {
    await new Promise((r) => setTimeout(r, 800));
    return json({ error: "Incorrect passcode" }, 401);
  }
  if (body.action === "verify") return json({ ok: true });
  if (body.action !== "publish") return json({ error: "Unknown action" }, 400);

  const page = String(body.page || "");
  if (!/^[a-z0-9-]{1,40}$/.test(page)) return json({ error: "Bad page" }, 400);

  const content = (await store.get("content", { type: "json" })) || { pages: {}, photos: null };
  content.pages = content.pages || {};

  if (body.edits && typeof body.edits === "object") {
    const clean = {};
    for (const [k, v] of Object.entries(body.edits)) {
      if (/^\d{1,3}$/.test(k) && typeof v === "string" && v.length < 20000) clean[k] = v;
    }
    content.pages[page] = clean;
  }

  if (Array.isArray(body.photos)) {
    const existing = Array.isArray(content.photos) ? content.photos : [];
    const out = [];
    const stamp = Date.now();
    for (let i = 0; i < Math.min(body.photos.length, 12); i++) {
      const p = body.photos[i];
      if (p === null) { out[i] = null; continue; }
      if (p === "keep") { out[i] = existing[i] || null; continue; }
      const m = typeof p === "string" && p.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!m) return json({ error: "Bad photo" }, 400);
      const bytes = Buffer.from(m[2], "base64");
      if (bytes.length > 2_500_000) return json({ error: "Photo too large" }, 413);
      await store.set("photo-" + i, bytes, { metadata: { type: m[1] } });
      out[i] = `/.netlify/functions/content?photo=${i}&v=${stamp}`;
    }
    content.photos = out;
  }

  await store.setJSON("content", content);
  return json({ ok: true });
};
