import {SUCURSAL} from './../providers/sucursal/sucursal';
import {CajaMovimiento} from './../models/fondos.clases';
import * as moment from 'moment';
import {FECHA} from '../models/comunes.clases';
import {formatTable, showPdf, setInfo} from './config-comun';

export function printCajaMovimientos(
    movimientos: CajaMovimiento[],
    ingresos: {efectivo: number, dolares: number, cheques: number},
    egresos: {efectivo: number, dolares: number, cheques: number}) {
  if (movimientos && movimientos.length > 0) {
    formatTable();
    let data: any[] = [];
    // Titulos
    data.push([
      {text: 'Fecha', bold: true},
      {text: 'Tipo', bold: true},
      {text: 'Comprobante', bold: true},
      {text: 'Efectivo', bold: true},
      {text: 'Saldo Efectivo', bold: true},
      {text: 'Dolares', bold: true},
      {text: 'Saldo Dolares', bold: true},
      {text: 'Cheques', bold: true},
      {text: 'Saldo Cheques', bold: true}
    ]);
    // Datos
    movimientos.forEach((m) => {
      data.push([
        {text: `${moment(m.fecha, FECHA).format('DD/MM/YYYY')}`, bold: true},
        {text: `${(m.isIngreso)?'IN':'EG'}`, bold: false},
        {text: `${m.id}`, bold: false},
        {text: `$ ${m.efectivo.toFixed(2)}`, bold: false},
        {text: `$ ${m.saldoEfectivo.toFixed(2)}`, bold: true},
        {text: `U$ ${m.dolares.toFixed(2)}`, bold: false},
        {text: `U$ ${m.saldoDolares.toFixed(2)}`, bold: true},
        {text: `$ ${m.cheques.toFixed(2)}`, bold: false},
        {text: `$ ${m.saldoCheques.toFixed(2)}`, bold: true}

      ]);
    });
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
    showPdf(doc, true);
  }
}