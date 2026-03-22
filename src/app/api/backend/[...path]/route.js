const getBackendBaseUrl = () => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    'http://localhost:5003';
  return String(raw).replace(/\/+$/g, '');
};

const buildTargetUrl = (requestUrl, pathSegments) => {
  const base = getBackendBaseUrl();
  const pathname = pathSegments.map((segment) => encodeURIComponent(segment)).join('/');
  const url = new URL(requestUrl);
  const search = url.search || '';
  return `${base}/api/${pathname}${search}`;
};

const buildForwardHeaders = (requestHeaders) => {
  const headers = new Headers();

  for (const [key, value] of requestHeaders.entries()) {
    const lower = key.toLowerCase();
    if (lower === 'host') continue;
    if (lower === 'connection') continue;
    if (lower === 'content-length') continue;
    headers.set(key, value);
  }

  return headers;
};

async function proxy(request, context) {
  const resolvedParams = (await context?.params) || {};
  const path = resolvedParams.path;
  const pathSegments = Array.isArray(path) ? path : [String(path || '')].filter(Boolean);

  const targetUrl = buildTargetUrl(request.url, pathSegments);
  const method = request.method || 'GET';

  const forwardHeaders = buildForwardHeaders(request.headers);

  const hasBody = !['GET', 'HEAD'].includes(method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstreamResponse = await fetch(targetUrl, {
    method,
    headers: forwardHeaders,
    body,
    redirect: 'manual',
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  return new Response(await upstreamResponse.arrayBuffer(), {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
