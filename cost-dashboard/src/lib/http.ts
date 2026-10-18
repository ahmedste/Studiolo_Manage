export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, url: string, body: string) {
    // Never echo request headers (they hold the API key); the body is the vendor's error text.
    super(`HTTP ${status} from ${new URL(url).host}: ${body.slice(0, 200)}`);
    this.status = status;
    this.url = url;
  }
}

export async function request(url: string | URL, init: RequestInit = {}, timeoutMs = 20_000): Promise<Response> {
  const res = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new HttpError(res.status, String(url), await res.text().catch(() => ""));
  return res;
}

export async function getJson<T = unknown>(url: string | URL, init: RequestInit = {}): Promise<T> {
  const res = await request(url, init);
  return (await res.json()) as T;
}
