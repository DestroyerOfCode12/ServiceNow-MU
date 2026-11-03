import { SITE_URL } from "@/lib/site";

/**
 * IndexNow key, served as a plaintext file at the site root so Bing/Yandex
 * can verify key ownership before accepting submissions. Not a secret —
 * it's published at INDEXNOW_KEY_LOCATION precisely so search engines can
 * read it — just unique enough that a third party can't submit URLs on our
 * behalf under it.
 */
export const INDEXNOW_KEY = "a10ee4da4b8822f59db1ede0042a0f0a";
export const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

/**
 * Submits URLs to the IndexNow API (https://www.indexnow.org), which fans
 * the submission out to every participating engine (Bing, Yandex, Seznam,
 * Naver, Yep — notably not Google, which doesn't support IndexNow).
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<{ ok: boolean; status: number; body: string }> {
  if (urls.length === 0) throw new Error("No URLs to submit.");

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: urls,
    }),
  });

  const body = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, body };
}
