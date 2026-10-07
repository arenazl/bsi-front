// Rutea /api/* al backend en Cloud Run, desde el mismo origen.
// Va como Pages Function y no como _redirects porque el proxy tiene que preservar
// metodo, cuerpo y cabeceras: un redirect 30x convierte un POST en GET y el login se rompe.
const BACKEND = 'https://bsi-api-239185000261.us-east4.run.app';

export async function onRequest({ request, params }) {
  const ruta = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const entrada = new URL(request.url);
  const destino = `${BACKEND}/api/${ruta}${entrada.search}`;

  const cabeceras = new Headers(request.headers);
  cabeceras.delete('host');          // si viaja, Cloud Run rechaza por host desconocido
  cabeceras.set('x-forwarded-host', entrada.host);

  const r = await fetch(destino, {
    method: request.method,
    headers: cabeceras,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  });
  return new Response(r.body, { status: r.status, headers: r.headers });
}
