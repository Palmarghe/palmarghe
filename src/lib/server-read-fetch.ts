/** Bound complete PostgREST GET responses; mutations and Auth retain their transport. */
export function serverReadFetch(transport: typeof fetch = fetch, timeoutMs = 12_000): typeof fetch {
  return async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (method !== 'GET' || !url.pathname.startsWith('/rest/v1/')) return transport(input, init);

    const controller = new AbortController();
    const caller = init?.signal ?? (input instanceof Request ? input.signal : undefined);
    if (caller?.aborted) throw caller.reason ?? new DOMException('Cancelled', 'AbortError');
    const abort = () => controller.abort(caller?.reason);
    if (caller?.aborted) abort();
    else caller?.addEventListener('abort', abort, { once: true });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        // PostgREST never retries AbortError; TimeoutError would restart the expired read.
        const error = new DOMException('Database read deadline exceeded', 'AbortError');
        controller.abort(error);
        reject(error);
      }, timeoutMs);
    });
    try {
      return await Promise.race([
        (async () => {
          const response = await transport(input, { ...init, signal: controller.signal });
          // Keep the deadline until the body is complete, rather than just until headers arrive.
          const body = await response.arrayBuffer();
          return new Response(body.byteLength ? body : null, {
            status: response.status, statusText: response.statusText, headers: response.headers,
          });
        })(),
        deadline,
      ]);
    } finally {
      clearTimeout(timer);
      caller?.removeEventListener('abort', abort);
    }
  };
}
