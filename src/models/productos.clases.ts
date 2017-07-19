export class Perfil {
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

export class Linea {
  id: string;
  Nombre: string;
  Descripcion: string;
}

//{"id": "string", "idColorPlanta": "string","Nombre": "string","Descripcion": "string",  "PrecioUs": 6, "isPintura":true}
export class Color {
  id: string;
  idColorPlanta: string;
  Nombre: string;
  Descripcion: string;
  PrecioUs: number;
  isPintura: boolean;
}


