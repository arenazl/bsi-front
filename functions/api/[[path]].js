// Rutea /api/* al backend en Cloud Run, desde el mismo origen.
// Va como Pages Function y no como _redirects porque el proxy tiene que preservar
// metodo, cuerpo y cabeceras: un redirect 30x convierte un POST en GET y el login se rompe.
//
// El backend NO esta escrito aca: sale de BACKEND_ORIGIN, una variable del proyecto de
// Pages. Hasta el 2026-10-08 estaba fijo apuntando a produccion, y con eso el mismo
// codigo publicado en el proyecto de QA le pegaba a la base de Chacabuco.
//
// Si la variable falta, contesta 503 y lo dice. A proposito: el modo de fallar de un
// proxy mal configurado tiene que ser "no funciono", nunca "funciono contra produccion".
export async function onRequest({ request, params, env }) {
  const backend = env.BACKEND_ORIGIN;
  if (!backend) {
    return new Response(
      'Falta la variable BACKEND_ORIGIN en el proyecto de Pages: el proxy no sabe a que backend pegarle.',
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  const ruta = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const entrada = new URL(request.url);
  const destino = `${backend.replace(/\/+$/, '')}/api/${ruta}${entrada.search}`;

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
