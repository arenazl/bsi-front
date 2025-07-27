export const environment = {
  production: false,
  apiUrl: 'https://bsi-back-new-bee31231bd56.herokuapp.com/api',
  appName: 'BSI Sistema de Gestión de Pagos',
  appVersion: '2.0.0',
  
  // JWT Configuration
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  
  // Feature flags
  features: {
    enableAudit: true,
    enableFTP: true,
    enableAI: false,
    enableDebugMode: false
  },
  
  // Timeouts (en milisegundos)
  httpTimeout: 60000,
  uploadTimeout: 300000
};
