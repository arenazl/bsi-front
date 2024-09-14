
import { Title } from '@angular/platform-browser';


export interface Solicitud {
  id?: number,
  id_barrio?: number,
  barrio?: string,

  denominacion?: string,
  dni?: number,
  estado_civil?: string,
  telefono?: number,

  denominacion_2?: string,
  dni_2?: number,
  estado_civil_2?: string,
  telefono_2?: number,

  denominacion_3?: string,
  dni_3?: number,
  estado_civil_3?: string,
  telefono_3?: number,

  id_estado?: number,
  estado?: string,

  nombre_archivo_1?: string,
  nombre_archivo_2?: string,
  nombre_archivo_3?: string,
  nombre_archivo_4?: string,
  nombre_archivo_5?: string,

  observaciones_s?: string,
  observaciones_v?: string,
  observaciones_a?: string,
  observaciones_p?: string,
  observaciones_f?: string,

  fecha_firma?: Date

  id_lote?: number,
  id_lote_2?: number,
  id_lote_3?: number,
  id_lote_4?: number,
  id_lote_5?: number,
  id_lote_6?: number,
  id_lote_7?: number,
  id_lote_8?: number,
  id_lote_9?: number,
  id_lote_10?: number,

  lote_append?: string,

  id_grupo?: number,
  grupo?: string,
  timestamp?: Date,
  archivos?: Array<FileForTable>

  refuerzo_total?: number;
  pago_total?: number;
  lote_total?: number;

  parcial_lbl?: number;
  resta_lbl?: number;

  pago_completo?: number;

  blobArray?: Array<string>;

  fileCant?: number;

  id_agenda?: number;
};



export interface Refuerzo {
  id?: number,
  id_solicitud?: number,
  id_barrio?: number,
  descripcion?: string,
  monto?: number,
  pago_completo: boolean,
  nota?: string,

};

export interface FinPago {
  tipo?: number,
  id_solicitud?: number,
  id_barrio?: number,
};

export interface FileRes {
  originalname?: string,
  uploadname?: string
};

export interface FileForTable {
  friendlyName?: string,
  fileName?: string
};

export interface PdfConfig {
  headerColor: { r: number, g: number, b: number };
  detailColor: { r: number, g: number, b: number };
  titleColor: { r: number, g: number, b: number };
  headerFontSize: number;
  detailFontSize: number;
  title: string;
  titleFontSize: number;
  headerData: { [key: string]: any };
  detailData: Array<{ [key: string]: any }>;
  headerFields: Array<{ label: string, key: string }>;
  detailFields: Array<{ label: string, key: string }>;
}


export interface PdfConfigContrato {
  municipio: string;
  fecha: string;
  cantidadTransferencias: number;
  totalImporte: number;
  fechaPago: string;
}

export interface dbResponse {
  estado: number;            // Representa el estado (1 o 0, por ejemplo)
  descripcion: string;       // Mensaje descriptivo sobre el resultado
  data: any | null;          // Datos específicos, pueden ser un objeto o null si no hay datos
}

export interface dbRequest{
  sp_name: string,
  body: any,
  jsonUnify?: boolean
}

export interface Usuario {

  Id: number;
  IdOrganismo: number;
  Nombre_Organismo: string;
  Apellido: string;
  Nombre: string;
  Cargo_Funcion: string;
  Pass: string;

  panel?: boolean,
  esAdmin?: boolean

};

export interface Item {
  Orden: number;
  Contrato_ID: number;
  Rotulo: string;
  Cuenta_Debito: string;
  Texto_Boton: string;
  Tipo_Estado: boolean;
  Concepto: string;
}


export interface Params {
  tg?: Number,
  grupo?: number,
  id_barrio?: number,
  fecha_start_firma?: Date
  fecha_end_firma?: Date
  fecha_start_seña?: Date
  fecha_end_seña?: Date
  id_agenda?: number;
};

export interface Lotes {
  id?: number,
  estado: number,
  id_barrio: number,
  observaciones?: string,
  timestamp?: Date
};

export interface Ventas {
  id_grupo: number,
  descripcion: string,
  total: number,
  indice?: number
};

export interface LotesParams {
  estado?: EnumLotes,
};

export enum EnumLotes {
  Disponible = 0,
  Reservado = 1,
  Cargado = 2,
  Vendido = 3,
}

export interface LotesFilterOptions {
  estado: number,
  id_barrio: number
}

export interface Provincias {
  id: number,
  provincia: string
}
export interface Localidades {
  id: number,
  id_provincia: number,
  localidad: string
}

export interface Altas_Payload {
  IDUSER: number,
  IDORG: number,
  IDCONT: string,
  ITEMS: Array<any>
}


export interface SendFilePayload {
  CONCEPTO: string;
  FECHAPAGO: string;
  IDCONT: string | null;
  IDORG: string | null;
  IDUSER: string | null;
  ITEMS: Array<ITEMS>;
 
}

export interface ITEMS {
  CBU: any;
  CUIL: any;
  IMPORTE: any;
  NOMBRE: any;
}

