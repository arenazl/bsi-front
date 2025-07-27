/**
 * Helper de sesión - Funciones puras para manejo de sessionStorage
 * No requiere inyección de dependencias
 */

export interface OperationContext {
  contratoId: string;
  organismoId: string;
  userId: string;
  concepto?: string;
  fechaPago?: string;
}

/**
 * Obtiene el contexto actual desde sessionStorage
 */
export function obtenerContextoActual(): OperationContext {
  const contratoId = sessionStorage.getItem('IdContrato') || '';
  const organismoId = sessionStorage.getItem('IdOrganismo') || '';
  const userId = sessionStorage.getItem('idUser') || '';
  const concepto = sessionStorage.getItem('Concepto') || '';

  if (!contratoId || !organismoId || !userId) {
    throw new Error('Contexto incompleto: faltan datos de sesión requeridos');
  }

  return {
    contratoId,
    organismoId,
    userId,
    concepto,
    fechaPago: new Date().toISOString().split('T')[0] // Fecha actual por defecto
  };
}

/**
 * Valida que el contexto tenga todos los datos requeridos
 */
export function validarContexto(context: OperationContext): void {
  const requiredFields = ['contratoId', 'organismoId', 'userId'];
  const missingFields = requiredFields.filter(field => !context[field as keyof OperationContext]);
  
  if (missingFields.length > 0) {
    throw new Error(`Faltan campos requeridos en el contexto: ${missingFields.join(', ')}`);
  }
}

/**
 * Actualiza el contexto con nuevos valores
 */
export function actualizarContexto(updates: Partial<OperationContext>): void {
  if (updates.contratoId) {
    sessionStorage.setItem('IdContrato', updates.contratoId);
  }
  if (updates.organismoId) {
    sessionStorage.setItem('IdOrganismo', updates.organismoId);
  }
  if (updates.userId) {
    sessionStorage.setItem('idUser', updates.userId);
  }
  if (updates.concepto) {
    sessionStorage.setItem('Concepto', updates.concepto);
  }
}

/**
 * Obtiene un contexto con valores por defecto para testing
 */
export function obtenerContextoTest(): OperationContext {
  return {
    contratoId: 'TEST_CONTRATO',
    organismoId: 'TEST_ORGANISMO', 
    userId: 'TEST_USER',
    concepto: 'TEST_CONCEPTO',
    fechaPago: new Date().toISOString().split('T')[0]
  };
}

/**
 * Limpia el contexto de sesión
 */
export function limpiarContexto(): void {
  sessionStorage.removeItem('IdContrato');
  sessionStorage.removeItem('IdOrganismo');
  sessionStorage.removeItem('idUser');
  sessionStorage.removeItem('Concepto');
}

/**
 * Verifica si hay un contexto válido en la sesión
 */
export function tieneContextoValido(): boolean {
  try {
    const context = obtenerContextoActual();
    validarContexto(context);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene un valor específico del sessionStorage
 */
export function obtenerValorSesion(key: string): string | null {
  return sessionStorage.getItem(key);
}

/**
 * Establece un valor en sessionStorage
 */
export function establecerValorSesion(key: string, value: string): void {
  sessionStorage.setItem(key, value);
}

/**
 * Remueve un valor del sessionStorage
 */
export function removerValorSesion(key: string): void {
  sessionStorage.removeItem(key);
}

/**
 * Limpia todo el sessionStorage
 */
export function limpiarSesionCompleta(): void {
  sessionStorage.clear();
}