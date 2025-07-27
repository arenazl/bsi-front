/**
 * Helper de validaciones - Funciones puras para validar datos
 * No requiere inyección de dependencias
 */

const STORAGE_KEY = 'validationData';

/**
 * Guardar datos de validación en localStorage
 */
export function guardarDatosValidacion(data: any): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Obtener datos de validación desde localStorage
 */
export function obtenerDatosValidacion(): any {
  const storedData = localStorage.getItem(STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : null;
}

/**
 * Limpiar datos de validación
 */
export function limpiarDatosValidacion(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Validar CUIL argentino
 */
export function validarCuil(cuil: string): { valido: boolean; error?: string } {
  if (!cuil) {
    return { valido: false, error: 'CUIL es requerido' };
  }

  // Remover guiones y espacios
  const cuilLimpio = cuil.replace(/[-\s]/g, '');

  // Verificar longitud
  if (cuilLimpio.length !== 11) {
    return { valido: false, error: 'CUIL debe tener 11 dígitos' };
  }

  // Verificar que sean solo números
  if (!/^\d{11}$/.test(cuilLimpio)) {
    return { valido: false, error: 'CUIL debe contener solo números' };
  }

  // Algoritmo de validación de CUIL
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 10; i++) {
    suma += parseInt(cuilLimpio[i]) * multiplicadores[i];
  }

  const resto = suma % 11;
  const digitoVerificador = resto < 2 ? resto : 11 - resto;

  if (parseInt(cuilLimpio[10]) !== digitoVerificador) {
    return { valido: false, error: 'CUIL inválido (dígito verificador incorrecto)' };
  }

  return { valido: true };
}

/**
 * Validar CBU argentino
 */
export function validarCbu(cbu: string): { valido: boolean; error?: string; banco?: string } {
  if (!cbu) {
    return { valido: false, error: 'CBU es requerido' };
  }

  // Remover espacios y guiones
  const cbuLimpio = cbu.replace(/[-\s]/g, '');

  // Verificar longitud
  if (cbuLimpio.length !== 22) {
    return { valido: false, error: 'CBU debe tener 22 dígitos' };
  }

  // Verificar que sean solo números
  if (!/^\d{22}$/.test(cbuLimpio)) {
    return { valido: false, error: 'CBU debe contener solo números' };
  }

  // Validar primer bloque (banco + sucursal + dígito verificador)
  const primerBloque = cbuLimpio.substring(0, 7);
  const dvPrimerBloque = parseInt(cbuLimpio[7]);
  
  let suma1 = 0;
  const factores1 = [7, 1, 3, 9, 7, 1, 3];
  
  for (let i = 0; i < 7; i++) {
    suma1 += parseInt(primerBloque[i]) * factores1[i];
  }
  
  const dv1Calculado = (10 - (suma1 % 10)) % 10;
  
  if (dvPrimerBloque !== dv1Calculado) {
    return { valido: false, error: 'CBU inválido (primer dígito verificador incorrecto)' };
  }

  // Validar segundo bloque (cuenta + dígito verificador)
  const segundoBloque = cbuLimpio.substring(8, 21);
  const dvSegundoBloque = parseInt(cbuLimpio[21]);
  
  let suma2 = 0;
  const factores2 = [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3];
  
  for (let i = 0; i < 13; i++) {
    suma2 += parseInt(segundoBloque[i]) * factores2[i];
  }
  
  const dv2Calculado = (10 - (suma2 % 10)) % 10;
  
  if (dvSegundoBloque !== dv2Calculado) {
    return { valido: false, error: 'CBU inválido (segundo dígito verificador incorrecto)' };
  }

  // Obtener banco
  const codigoBanco = cbuLimpio.substring(0, 3);
  
  return { 
    valido: true, 
    banco: obtenerNombreBanco(codigoBanco)
  };
}

/**
 * Validar email
 */
export function validarEmail(email: string): { valido: boolean; error?: string } {
  if (!email) {
    return { valido: false, error: 'Email es requerido' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valido: false, error: 'Formato de email inválido' };
  }

  return { valido: true };
}

/**
 * Validar teléfono argentino
 */
export function validarTelefono(telefono: string): { valido: boolean; error?: string } {
  if (!telefono) {
    return { valido: false, error: 'Teléfono es requerido' };
  }

  // Remover espacios, guiones y paréntesis
  const telefonoLimpio = telefono.replace(/[-\s()]/g, '');

  // Verificar que tenga entre 8 y 15 dígitos
  if (telefonoLimpio.length < 8 || telefonoLimpio.length > 15) {
    return { valido: false, error: 'Teléfono debe tener entre 8 y 15 dígitos' };
  }

  // Verificar que sean solo números
  if (!/^\d+$/.test(telefonoLimpio)) {
    return { valido: false, error: 'Teléfono debe contener solo números' };
  }

  return { valido: true };
}

/**
 * Validar importe monetario
 */
export function validarImporte(importe: number | string): { valido: boolean; error?: string } {
  if (importe === null || importe === undefined || importe === '') {
    return { valido: false, error: 'Importe es requerido' };
  }

  const importeNum = typeof importe === 'string' ? parseFloat(importe) : importe;

  if (isNaN(importeNum)) {
    return { valido: false, error: 'Importe debe ser un número válido' };
  }

  if (importeNum <= 0) {
    return { valido: false, error: 'Importe debe ser mayor a 0' };
  }

  if (importeNum > 999999999.99) {
    return { valido: false, error: 'Importe demasiado grande' };
  }

  return { valido: true };
}

/**
 * Validar fecha
 */
export function validarFecha(fecha: string, permitirFutura: boolean = true): { valido: boolean; error?: string } {
  if (!fecha) {
    return { valido: false, error: 'Fecha es requerida' };
  }

  const fechaObj = new Date(fecha);
  
  if (isNaN(fechaObj.getTime())) {
    return { valido: false, error: 'Formato de fecha inválido' };
  }

  if (!permitirFutura && fechaObj > new Date()) {
    return { valido: false, error: 'La fecha no puede ser futura' };
  }

  // Verificar que no sea demasiado antigua (más de 100 años)
  const hace100Anos = new Date();
  hace100Anos.setFullYear(hace100Anos.getFullYear() - 100);
  
  if (fechaObj < hace100Anos) {
    return { valido: false, error: 'Fecha demasiado antigua' };
  }

  return { valido: true };
}

/**
 * Obtener nombre del banco por código
 */
function obtenerNombreBanco(codigo: string): string {
  const bancos: { [key: string]: string } = {
    '007': 'Banco de Galicia',
    '011': 'Banco de la Nación Argentina',
    '014': 'Banco de la Provincia de Buenos Aires',
    '015': 'ICBC',
    '016': 'Citibank',
    '017': 'BBVA',
    '020': 'Banco de la Provincia de Córdoba',
    '027': 'Banco Supervielle',
    '034': 'Banco Patagonia',
    '044': 'Banco Hipotecario',
    '072': 'Banco Santander',
    '150': 'HSBC Bank',
    '191': 'Banco Credicoop',
    '285': 'Banco Macro',
    '299': 'Banco Comafi'
  };

  return bancos[codigo] || `Banco desconocido (${codigo})`;
}