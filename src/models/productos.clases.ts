export class Perfil {
  id: string;
  Linea: Linea;
  Codigo: string;
  Descripcion: string;
  Largo: number;
  BarrasPaquete: number;
  PesoMetro: number;
}

export class Linea {
  id: string;
  Nombre: string;
  Descripcion: string;
}

export class Color {
  id: string;
  Nombre: string;
  Descripcion: string;
  Incremento: number;
}