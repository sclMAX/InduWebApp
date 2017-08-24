import { Pedido } from './pedidos.clases';
import { ClaseControlada, FECHA } from './comunes.clases';
import * as moment from 'moment';

export class Reparto extends ClaseControlada {
    id: number;
    fecha: string = moment().format(FECHA);
    nombre:string;
    chofer:string;
    comentarios:string;
    Pedidos: RepartoPedido[] = [];
    totalKilos:number = 0.00;
    totalDolares:number = 0.00;    
    saldoTotal:number = 0.00;
}

export class RepartoPedido{
    idCliente:number;
    Pedidos:Pedido[] = [];
    totalKilos:number;
    totalPedidos:number = 0.00;
    saldoActual:number = 0.00;
}