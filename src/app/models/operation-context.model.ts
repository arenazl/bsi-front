// OperationContext movido a helpers/session.helper.ts

export interface NominaItem {
  cbu: string;
  cuil: string;
  apellido: string;
  nombre: string;
  importe?: number;
}

export interface ProcessResult {
  phase: 'nomina' | 'pago' | 'complete';
  success: boolean;
  nominaId?: string;
  pagoId?: string;
  navigateTo: string;
  error?: any;
}

export interface NominaPayload {
  IDCONT: string;
  IDORG: string;
  IDUSER: string;
  ITEMS: Array<{
    CBU: string;
    CUIL: string;
    APELLIDO: string;
    NOMBRE: string;
  }>;
}

export interface PagoPayload {
  CONCEPTO: string;
  FECHAPAGO: string;
  IDCONT: string;
  IDORG: string;
  IDUSER: string;
  ITEMS: Array<{
    CBU: string;
    CUIL: string;
    IMPORTE: number;
    NOMBRE: string;
  }>;
}