import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ContractContext {
  contractId: number;
  contractName: string;
  modalidad: string;
  tipoModulo: string;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ContractStateService {
  private contractSubject = new BehaviorSubject<ContractContext | null>(null);
  public contract$ = this.contractSubject.asObservable();

  constructor() {}

  /**
   * Establece el contexto del contrato actual
   */
  setContractContext(context: ContractContext): void {
    this.contractSubject.next(context);
    // Opcionalmente guardar en sessionStorage como backup
    sessionStorage.setItem('currentContractContext', JSON.stringify(context));
  }

  /**
   * Obtiene el contexto del contrato actual
   */
  getContractContext(): ContractContext | null {
    let context = this.contractSubject.value;
    
    // Si no hay contexto en memoria, intentar recuperar de sessionStorage
    if (!context) {
      const stored = sessionStorage.getItem('currentContractContext');
      if (stored) {
        context = JSON.parse(stored);
        this.contractSubject.next(context);
      }
    }
    
    return context;
  }

  /**
   * Limpia el contexto del contrato
   */
  clearContractContext(): void {
    this.contractSubject.next(null);
    sessionStorage.removeItem('currentContractContext');
  }

  /**
   * Navega a un módulo con contexto de contrato
   */
  navigateWithContract(router: any, route: string, context: ContractContext): void {
    this.setContractContext(context);
    router.navigate([route]);
  }
}