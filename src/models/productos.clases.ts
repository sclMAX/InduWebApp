import {ClaseControlada} from './comunes.clases';

export class Perfil extends ClaseControlada {
  id: string;
  Linea: Linea;
  codigo: string;
  descripcion: string;
  largo: number;
  barrasPaquete: number;
  pesoBase: number;
  pesoNatural: number;
  pesoPintado: number;
  notInStock:boolean = false;
}

export class Linea extends ClaseControlada {
  id: string;
  nombre: string;
  descripcion: string;
  adicional: number = 0;
}

export class Color extends ClaseControlada {
  id: string;
  idColorPlanta: string;
  nombre: string;
  descripcion: string;
  precioUs: number;
  isPintura: boolean;
}

export class Accesorio{
  id:string;
  idClase:string;
  nombre:string;
  descripcion:string;
  precioUs:number = 0.00;
}
