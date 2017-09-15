import {FECHA, ClaseControlada} from './comunes.clases';
import {Direccion} from './clientes.clases';
import * as moment from 'moment';

export const EGRESO: string = 'Egreso';
export const INGRESO:string = 'Ingreso';

export class Dolar extends ClaseControlada {
  id: string = "Dolar";
  fecha: string = moment().format(FECHA);
  valor: number;
}

export class CajaItem extends ClaseControlada {
  id: string;
  tipoDocumento: string;
  numeroDoc: number;
  fecha: string = moment().format(FECHA);
  efectivo: number = 0.00;
  dolares: number = 0.00;
  cheques: number = 0.00;
  comentarios: string;
  isIngreso: boolean = false;
}

export class CajaMovimiento extends CajaItem {
  saldoEfectivo: number = 0.00;
  saldoCheques: number = 0.00;
  saldoDolares: number = 0.00;
}

export interface Saldos {
  saldoEfectivo: number;
  saldoDolares: number;
  saldoCheques: number;
}

export class Cheque extends ClaseControlada {
  id: string;  // "idBanco"-"idSucursal"-"Numero"
  idBanco: number;
  idSucursal: number;
  numero: number;
  fechaIngreso: string = moment().format(FECHA);
  fechaEmision: string;
  fechaCobro: string;
  monto: number;
  cuenta: string;
  Firmantes: ChequeFirmante[] = [];
  EntregadoPor: ChequeEntregadoPor;
  EntregadoA: ChequeEntregadoA;
  comentarios: string;
  refDolar:number = 0.00;
}

export class ChequeEntregadoPor {
  sucursal: string;
  idCliente: number;
  comentarios:string;
}

export class ChequeEntregadoA {
  nombre: string;
  fecha: string = moment().format(FECHA);
}

export class ChequeFirmante {
  CUIT: number;
  nombre: string;
  constructor(cuit?: number, nombre?: string) {
    this.CUIT = cuit;
    this.nombre = nombre;
  }
}

export class Banco extends ClaseControlada {
  id: number;
  nombre: string;
  Sucursales: BancoSucursal[] = [];
}

export class BancoSucursal {
  id: number;
  nombre: string;
  Direccion: Direccion = new Direccion();
  telefono: string;
}

export class CajaEgreso extends ClaseControlada {
  id: number;
  fecha: string = moment().format(FECHA);
  tipo: string;
  efectivo: number = 0.00;
  dolares: number = 0.00;
  Cheques: Cheque[] = [];
  comentarios: string;
}

// FUNCIONES
export function validaCuit(cuit: string) {
  const sec = '5432765432';
  let aMult = sec.split('').map(Number);
  if (cuit && cuit.length == 11) {
    let aCUIT = cuit.split('').map(Number);
    let iResult: number = 0;
    for (let i = 0; i <= 9; i++) {
      iResult += aCUIT[i] * aMult[i];
    }
    iResult = (iResult % 11);
    iResult = 11 - iResult;
    if (iResult == 11) iResult = 0;
    if (iResult == 10) iResult = 9;
    if (iResult == aCUIT[10]) {
      return true;
    }
  }
  return false;
}