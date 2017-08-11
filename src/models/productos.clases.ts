import {ClaseControlada} from './comunes.clases';

export class Perfil extends ClaseControlada {
  id: string;
  Linea: Linea;
  Codigo: string;
  Descripcion: string;
  Largo: number;
  BarrasPaquete: number;
  PesoBase: number;
  PesoNatural: number;
  PesoPintado: number;
}

export class Linea extends ClaseControlada {
  id: string;
  Nombre: string;
  Descripcion: string;
  Adicional: number = 0;
}

export class Color extends ClaseControlada {
  id: string;
  idColorPlanta: string;
  Nombre: string;
  Descripcion: string;
  PrecioUs: number;
  isPintura: boolean;
}
