export class UserLogin {
  email: string;
  password: string;
}

export class Usuario{
  id:string;
  Sucursal:string;
  Nombre:string;
  isEmbalaje:boolean = false;
  MaxDescuentoItem:number = 0.00;
  MaxDescuentoGeneral:number = 0.00;
}