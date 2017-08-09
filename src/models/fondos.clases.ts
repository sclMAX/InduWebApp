import {FECHA, ClaseControlada} from './db-base-paths';
import {UserDoc} from './user.class';
import {Direccion} from './clientes.clases';
import * as moment from 'moment';
export class Fondos {}

export class Dolar {
  id: string = "Dolar";
  Fecha: string = moment().format(FECHA);
  Valor: number;
}

export class Cheque extends ClaseControlada {
  id: string;  // "idBanco"-"idSucursal"-"Numero"
  idBanco: number;
  idSucursal: number;
  Numero: number;
  FechaIngreso: string = moment().format(FECHA);
  FechaEmision: string;
  FechaCobro: string;
  Monto: number;
  Cuenta: string;
  Firmantes: ChequeFirmante[] = [];
  EntregadoPor: ChequeEntregadoPor;
  EntregadoA: ChequeEntregadoA;
  Comentarios: string;
}

export class ChequeEntregadoPor {
  Sucursal: string;
  idCliente: number;
}

export class ChequeEntregadoA {
  Nombre: string;
  Fecha: string = moment().format(FECHA);
}

export class ChequeFirmante {
  CUIT: number;
  Nombre: string;
}

export class Banco extends ClaseControlada {
  id: number;
  Nombre: string;
  Sucursales: BancoSucursal[] = [];
}

export class BancoSucursal {
  id: number;
  Nombre: string;
  Direccion: Direccion = new Direccion();
  Telefono: string;
}

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