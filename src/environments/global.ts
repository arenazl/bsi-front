
export const GlobalVariable = Object.freeze({
    // Mismo origen: la Pages Function de functions/api/[[path]].js rutea /api al backend
    // en Cloud Run. El front no sabe donde vive el backend, y por eso no hay CORS ni una
    // URL que haya que cambiar en cada ambiente.
    // Historia: hasta 2026-10-07 esto apuntaba a mano a una de las tres apps de Heroku
    // (dev/qa/prod), comentando y descomentando lineas.
      BASE_API_URL: '/api'
});
