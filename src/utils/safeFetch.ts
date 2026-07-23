export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

const BACKEND_FALLBACK_BASE = 'https://min-maxxed-288113474432.us-central1.run.app';

export async function safeJsonFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<SafeFetchResult<T>> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await res.json();
      return {
        ok: res.ok,
        status: res.status,
        data,
        error: null
      };
    }

    // If relative /api request returned non-JSON (e.g. static hosting fallback index.html),
    // automatically retry using the live Cloud Run backend URL
    if (url.startsWith('/api')) {
      const fallbackUrl = `${BACKEND_FALLBACK_BASE}${url}`;
      console.warn(
        `[API Fallback] Relative endpoint ${url} returned HTML (${res.status}). Retrying with Cloud Run backend: ${fallbackUrl}`
      );

      const fallbackRes = await fetch(fallbackUrl, options);
      const fallbackContentType = fallbackRes.headers.get('content-type') || '';

      if (fallbackContentType.includes('application/json')) {
        const data = await fallbackRes.json();
        return {
          ok: fallbackRes.ok,
          status: fallbackRes.status,
          data,
          error: null
        };
      }
    }

    const text = await res.text();
    console.warn(
      `[API Warning] Endpoint ${url} returned non-JSON response (${res.status}):`,
      text.substring(0, 120)
    );
    return {
      ok: false,
      status: res.status,
      data: null,
      error: `Server returned non-JSON response (${res.status}).`
    };
  } catch (e: any) {
    // If primary relative fetch failed (network/CORS), attempt fallback if applicable
    if (url.startsWith('/api')) {
      try {
        const fallbackUrl = `${BACKEND_FALLBACK_BASE}${url}`;
        const fallbackRes = await fetch(fallbackUrl, options);
        const fallbackContentType = fallbackRes.headers.get('content-type') || '';
        if (fallbackContentType.includes('application/json')) {
          const data = await fallbackRes.json();
          return {
            ok: fallbackRes.ok,
            status: fallbackRes.status,
            data,
            error: null
          };
        }
      } catch (fallbackError) {
        // Silently ignore secondary error and return primary error below
      }
    }

    console.error(`[API Error] Network error fetching ${url}:`, e);
    return {
      ok: false,
      status: 0,
      data: null,
      error: e.message || 'Network fetch failure'
    };
  }
}
