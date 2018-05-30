import {ClientesProvider} from './../providers/clientes/clientes';
import {FondosProvider} from './../providers/fondos/fondos';
import {PagosProvider} from './../providers/pagos/pagos';
import {PAGO} from './../models/pedidos.clases';
import {SUCURSAL} from './../providers/sucursal/sucursal';
import {CajaMovimiento} from './../models/fondos.clases';
import * as moment from 'moment';
import {FECHA} from '../models/comunes.clases';
import {formatTable, showPdf, setInfo} from './config-comun';
import {Loading} from "ionic-angular";

function getDescripcion(item: CajaMovimiento, pagosP: PagosProvider,
                        fondosP: FondosProvider,
                        clientesP: ClientesProvider): Promise<string> {
  if (item) {
    if (item.isIngreso) {
      if (item.tipoDocumento == PAGO) {
        return new Promise<string>((res, rej) => {
          pagosP.getOne(item.numeroDoc)
              .subscribe(data => {clientesP.getOne(data.idCliente)
                                      .map(cliente => `PAGO ${cliente.nombre}`)
                                      .subscribe(data => res(data),
                                                 error => rej(error))},
                         error => rej(error));
        });
      } else {
        return new Promise((res, rej) => res('INGRESO NC'));
      }
    } else {
      return new Promise<string>((res, rej) => {
        fondosP.getCajaEgreso(item.numeroDoc)
            .map(data => data.tipo)
            .subscribe(data => res(data), error => rej(error));
      });
    }
  }
}

export async function printCajaMovimientos(
    movimientos: CajaMovimiento[],
    ingresos: {
  efectivo: number, dolares: number, cheques: number
},
    egresos: {efectivo: number, dolares: number, cheques: number},
  pagosP: PagosProvider, fondosP:FondosProvider, load:Loading, clientesP: ClientesProvider) {
  if (movimientos && movimientos.length > 0) {
    formatTable();
    let data: any[] = [];
    // Titulos
    data.push([
      {text: 'Fecha', bold: true},
      {text: 'Tipo', bold: true},
      {text: 'Comprobante', bold: true},
      {text: 'Detalle', bold: true},
      {text: 'Efectivo', bold: true},
      {text: 'Saldo Efectivo', bold: true},
      {text: 'Dolares', bold: true},
      {text: 'Saldo Dolares', bold: true},
      {text: 'Cheques', bold: true},
      {text: 'Saldo Cheques', bold: true}
    ]);
    // Datos
    for (let m of movimientos) {
      let descripcion = await getDescripcion(m, pagosP, fondosP, clientesP);
      data.push([
        {text: `${moment(m.fecha, FECHA).format('DD/MM/YYYY')}`, bold: true},
        {text: `${(m.isIngreso)?'IN':'EG'}`, bold: false},
        {text: `${m.id}`, bold: false},
        {text: `${descripcion}`, bold: false},
        {text: `$ ${m.efectivo.toFixed(2)}`, bold: false},
        {text: `$ ${m.saldoEfectivo.toFixed(2)}`, bold: true},
        {text: `U$ ${m.dolares.toFixed(2)}`, bold: false},
        {text: `U$ ${m.saldoDolares.toFixed(2)}`, bold: true},
        {text: `$ ${m.cheques.toFixed(2)}`, bold: false},
        {text: `$ ${m.saldoCheques.toFixed(2)}`, bold: true}

      ]);
    }
    // Ultimo movimientos para mostrar saldos
    let ultimoMov = movimientos[movimientos.length - 1];
    // Doc Definition
    let doc = {
      header: {
        columns: [
          {
            text: `Suc. ${SUCURSAL} - Movimientos de Caja`,
            margin: [50, 20],
            alignment: 'left',
            fontSize: 12,
            bold: true
          },
          {
            text: `${moment().format('DD/MM/YYYY hh:mm a')}`,
            margin: [50, 20],
            alignment: 'center'
          }
        ]
      },
      content: [
        {
          layout: 'lightHorizontalLines',  // optional
          table: {
            // headers are automatically repeated if the table spans over
            // multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: [
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto'
            ],
            body: data
          },
        },
        {
          columns: [
            [
              // to treat a paragraph as a bulleted list, set an array of items
              // under
              // the ul key
              {text: '\nIngresos:', fontSize: 15, bold: true},
              {
                ul: [
                  `Efectivo: $ ${ingresos.efectivo.toFixed(2)}`,
                  `Dolares : U$ ${ingresos.dolares.toFixed(2)}`,
                  `Cheques : $ ${ingresos.cheques.toFixed(2)}`,
                ]
              }
            ],
            [
              {text: '\nEgresos:', fontSize: 15, bold: true},
              {
                ul: [
                  `Efectivo: $ ${egresos.efectivo.toFixed(2)}`,
                  `Dolares : U$ ${egresos.dolares.toFixed(2)}`,
                  `Cheques : $ ${egresos.cheques.toFixed(2)}`,
                ]
              }
            ],
            [
              {text: '\nSaldos:', fontSize: 15, bold: true},
              {
                ul: [
                  `Efectivo: $ ${ultimoMov.saldoEfectivo.toFixed(2)}`,
                  `Dolares : U$ ${ultimoMov.saldoDolares.toFixed(2)}`,
                  `Cheques : $ ${ultimoMov.saldoCheques.toFixed(2)}`,
                ]
              }
            ]
          ]
        }
      ]
    };
    setInfo(doc, `Suc. ${SUCURSAL} - Movimientos de Caja`,
            'detalle de movimientos de caja');
    load.dismiss();
    showPdf(doc, true);
  }
}