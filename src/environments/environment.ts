// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiVersion: 'v2',
  appName: 'BSI Sistema de Gestión de Pagos',
  appVersion: '2.0.0',
  
  // JWT Configuration
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  
  // Feature flags
  features: {
    enableAudit: true,
    enableFTP: false, // FTP aún no implementado
    enableAI: false,  // OpenAI deshabilitado por ahora
    enableDebugMode: true
  },
  
  // Timeouts (en milisegundos)
  httpTimeout: 30000,
  uploadTimeout: 120000
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
