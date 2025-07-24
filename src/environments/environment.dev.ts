export const environment = {
  production: false,
  apiUrl: 'https://bsi-back-dev-22264eab9225.herokuapp.com/api',
  apiVersion: 'v2',
  appName: 'BSI Sistema de Gestión de Pagos (DEV)',
  appVersion: '2.0.0-dev',
  
  // JWT Configuration
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  
  // Feature flags
  features: {
    enableAudit: true,
    enableFTP: false, // En desarrollo
    enableAI: true,   // Pruebas con AI
    enableDebugMode: true
  },
  
  // Timeouts (en milisegundos)
  httpTimeout: 45000,
  uploadTimeout: 180000
};