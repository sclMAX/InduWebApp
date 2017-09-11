import {DatePipe, DecimalPipe} from '@angular/common';
import * as moment from 'moment';

import {Cliente} from './../models/clientes.clases';
import {Pedido} from './../models/pedidos.clases';
import {PedidosProvider} from './../providers/pedidos/pedidos';
import {formatTable, setInfo, showPdf} from './config-comun';

export function numFormat(val: number, format: string): string {
  let decimalPipe = new DecimalPipe('es');
  return decimalPipe.transform(val, format);
  }
export function dateFormat(val, format: string): string {
  let datePipe = new DatePipe('es');
  return datePipe.transform(val, format);
  }

export function printPresupuesto(
    cliente: Cliente, pedido: Pedido, title: string, pedidosP: PedidosProvider,
    dolar: number) {
  let doc: any = {};
  // Table lines config
  formatTable();
  setInfo(doc, title);
  doc.header = {
    columns: [
      [{
        text: `PRESUPUESTO Nro: ${numFormat(pedido.id, '3.0-0')}`,
        margin: [50, 20],
        alignment: 'left',
        fontSize: 12,
        bold: true
      }],
      [{
        text: `Fecha:${dateFormat(pedido.fecha, 'dd/MM/yyyy')}`,
        margin: [50, 20],
        alignment: 'right'
      }]
    ]
  };
  doc.content = [];
  doc.content.push({text: `Cliente: ${cliente.nombre}`, bold: true});
  doc.content.push(
      {text: `Telefono: ${cliente.Telefonos[0].numero}`, bold: true});
  if (pedido.comentario) {
    doc.content.push({
      text: `Comenterios: ${pedido.comentario || ''
                                                 }\n\n`,
      bold: false
    });
    }
  // Pedido Items
  let tData: any = [[
    'Cantidad', 'Codigo', 'Color', 'Largo', 'Unidades', 'Precio(U$)', 'SubTotal'
  ]];
  pedido.Items.forEach((i) => {
    tData.push([
      {text: `${i.cantidad}`, alignment: 'center'},
      {text: `${i.Perfil.codigo}`, alignment: 'center'},
      {text: `${i.Color.nombre}`, alignment: 'center'},
      {text: `${i.Perfil.largo}`, alignment: 'center'},
      {text: `${numFormat(i.unidades, '1.2-2')}kg`, alignment: 'right'},
      {text: `U$ ${numFormat(i.precioUs, '1.2-2')}`, alignment: 'right'}, {
        text: `U$ ${numFormat(pedidosP.calSubTotalU$(i, cliente), '1.2-2')}`,
        alignment: 'right'
      }
    ]);
  });
  doc.content.push({
    table: {
      widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', '*'],
      headerRows: 1,
      body: tData
    }
  });
  doc.content.push('\n\n');
  // Totales
  doc.content.push({
    table: {
      body: [
        [
          {text: 'Kilos: ', bold: true}, {
            text: `${numFormat(pedido.totalUnidades, '1.2-2')}kg`,
            alignment: 'right'
          },
          {text: 'Total Final(U$): ', bold: true}, {
            text: `U$ ${numFormat(pedido.totalFinalUs, '1.2-2')}`,
            alignment: 'right'
          }
        ],
        [
          {text: 'SubTotal: ', bold: true}, {
            text: `U$ ${numFormat(pedido.totalUs, '1.2-2')}`,
            alignment: 'right'
          },
          {text: `R.Dolar(${moment().format('DD/MM/YYYY')}):`, bold: true},
          {text: `$ ${numFormat(dolar, '1.3-3')}`, alignment: 'right'}
        ],
        [
          {text: 'CV: ', bold: true},
          {text: `${pedido.CV.tipo}`, alignment: 'right'},
          {text: 'Total Final($): ', bold: true}, {
            text: `$ ${numFormat((pedido.totalFinalUs * dolar), '1.2-2')}`,
            alignment: 'right'
          }
        ]
      ]
    },
    layout: 'noBorders',
  });
  doc.content.push({
    text:
        '\nEl presente esta expresado en Dolares (Banco Nacion Cotizacion Billetes Venta).\nLos valores en Pesos son a modo orientativo y seran recalculados al momento de la entrega.\nValidez del presente 7 dias. ',
    fontSize: 8,
    italics: true
  });
  showPdf(doc);
  }


export function printEntrega(
    cliente: Cliente, pedido: Pedido, title: string,
    pedidosP: PedidosProvider) {
  let doc: any = {};
  // Table lines config
  formatTable();
  setInfo(doc, title);
  doc.header = {
    columns: [
      [{
        text: `PEDIDO Nro: ${numFormat(pedido.id, '3.0-0')}`,
        alignment: 'left',
        fontSize: 12,
        bold: true,
      }],
      [{
        text:
            `Fecha:${dateFormat(pedido.fecha, 'dd/MM/yyyy')}\nFecha Entrega:${dateFormat(
                pedido.fechaEntrega, 'dd/MM/yyyy')}`,
        alignment: 'right'
      }]
    ],
    margin: [50, 10]
  };
  doc.content = [];
  // Lineas en blanco
  doc.content.push('\n');
  let telefonos = [{text: 'Telefonos', bold: true}];
  cliente.Telefonos.forEach((t) => {
    telefonos.push({text: `\r${t.contacto}: ${t.numero}`, bold: false});
  });
  doc.content.push({
    columns: [
      {
        text: [
          {text: 'Cliente: ', bold: true}, {text: `${cliente.nombre}`},
          {text: '\rDireccion: ', bold: true}, {
            text: `${cliente.Direccion.calle}, ${cliente.Direccion
                      .localidad}, ${cliente.Direccion.provincia}`
          },
          {text: '\rDireccion Entrega: ', bold: true}, {
            text: `${pedido.DireccionEntrega.calle}, ${pedido.DireccionEntrega
                      .localidad}, ${pedido.DireccionEntrega.provincia}`
          }
        ],
        width: '*'
      },
      {text: telefonos, width: 'auto'}
    ]
  });
  if (pedido.comentario) {
    doc.content.push({
      text: `Comenterios: ${pedido.comentario || ''
                                                 }`,
      bold: false
    });
    }
  // Pedido Items Preparar Table Data
  let tData: any = [[
    'Cantidad', 'Codigo', 'Color', 'Largo', 'Unidades', 'Precio(U$)', 'SubTotal'
  ]];
  pedido.Items.forEach((i) => {
    tData.push([
      {text: `${i.cantidad}`, alignment: 'center'},
      {text: `${i.Perfil.codigo}`, alignment: 'center'},
      {text: `${i.Color.nombre}`, alignment: 'center'},
      {text: `${i.Perfil.largo}`, alignment: 'center'},
      {text: `${numFormat(i.unidades, '1.2-2')}kg`, alignment: 'right'},
      {text: `U$ ${numFormat(i.precioUs, '1.2-2')}`, alignment: 'right'}, {
        text: `U$ ${numFormat(pedidosP.calSubTotalU$(i, cliente), '1.2-2')}`,
        alignment: 'right'
      }
    ]);
  });
  // Lineas en blanco
  doc.content.push('\n');
  // Agregar Table
  doc.content.push({
    table: {
      widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', '*'],
      headerRows: 1,
      body: tData
    }
  });
  // Lineas en blanco
  doc.content.push('\n');
  // Totales
  doc.content.push({
    table: {
      body: [
        // Fila1
        [
          // Col1 Paquetes label
          {text: 'Paquetes: ', bold: true},
          // Col2 Paquetes data
          {text: `${pedido.cantidadPaquetes}`, alignment: 'right'},
          //Col3 CV label
          {text:'CV',bold:true},
          //Col4 CV data
          {text:`${pedido.CV.tipo}`},
          //Col5 Total Final(U$) label
          {text: 'Total Final(U$): ', bold: true},
          //Col6 Total Final(U$) data
          {text: `U$ ${numFormat(pedido.totalFinalUs , '1.2-2')}`,alignment: 'right'}
        ],
        // Fila2
        [
          // Col1 Kilos label
          {text: 'Kilos: ', bold: true},
          // Col2 Kilos data
          {
            text: `${numFormat(pedido.totalUnidades, '1.2-2')}kg`,
            alignment: 'right'
          },
          //Col3
          {},
          //Col4
          {},
          //Col5
          {},
          //Col6
          {}
        ],
        // Fila3
        [
          //Col1
          {},
          //Col2
          {}, 
          //Col3
          {},
          //Col4
          {},
          //Col5 Ref Dolar label
          {
            text: [
              {text: 'R.Dolar', bold: true}, {
                text: `(${dateFormat(pedido.Dolar.fecha, 'dd/MM/yyyy')})`,
                fontSize: 8,
                bold: true
              },
              {text: ':', bold: true}
            ]
          },
          //Col6 Ref Dolar data
          {text: `$ ${numFormat(pedido.Dolar.valor, '1.2-2')}`,alignment: 'right'}
        ]
      ]
    },
    layout: 'noBorders',
  });

  showPdf(doc);
}