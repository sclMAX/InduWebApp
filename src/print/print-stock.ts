import {SUCURSAL} from './../providers/sucursal/sucursal';
import {StockItem} from './../models/stock.clases';
import {FECHA} from './../models/comunes.clases';
import {StockProvider} from './../providers/stock/stock';
import {Perfil} from './../models/productos.clases';
import {formatTable, setInfo, dateFormat, showPdf} from "./config-comun";
import * as moment from 'moment';

function toDataURL(url): Promise<string> {
  return new Promise<string>((res, rej) => {
    fetch(url)
        .then((response) => { return response.blob(); })
        .then((blob) => {
          var reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function() {
            let base64data = reader.result;
            res(<string>base64data);
          };
        })
        .catch(err => rej(err));
  });
}

function getStocks(idPerfil: string,
                   stkP: StockProvider): Promise<StockItem[]> {
  return new Promise<StockItem[]>((res, rej) => {
    stkP.getOneStokcs(idPerfil).subscribe(ok => res(ok), error => rej(error));
  });
}

export async function printStock(perfiles: Perfil[], stkP: StockProvider) {
  let doc: any = {};
  // Table lines config
  formatTable();
  setInfo(doc, `Suc. ${SUCURSAL}-Stock Al ${dateFormat(moment().format(FECHA),'dd/MM/yyyy')}`);
  doc.header = {
    columns: [
      [
        {
          text:
              `Suc. ${SUCURSAL}-Stock Al ${dateFormat(moment().format(FECHA),'dd/MM/yyyy')}`,
          alignment: 'left',
          fontSize: 12,
          bold: true,
        }
      ]
    ],
    margin: [50, 10]
  };
  doc.content = [];
  // Lineas en blanco
  //doc.content.push('\n');
  // Pedido Items Preparar Table Data
  let tData: any = [['Codigo', 'Perfil', 'Stocks', 'Stock Total']];
  for (let i of perfiles) {
    let img: string = await toDataURL(`assets/perfiles/80x80/${i.codigo}.png`);
    let st: number = await stkP.getOneTotalBarras(i.codigo);
    if ((st != 0) && (st)) {
      let stocks: StockItem[] = await getStocks(i.codigo, stkP);
      if (stocks) {
        stocks = stocks.filter((s) => s.stock != 0);
        let stks: any = [];
        for (let stk of stocks) {
          if (stk.stock != 0) {
            stks.push([
              {text: `${stk.id}:`, alignment: 'right', bold: 'true'},
              {text: `${stk.stock}`, alignment: 'right', bold: 'true'}
            ]);
          }
        }
        let dd = [
          {text: `${i.codigo}`, alignment: 'right'},        // Codigo
          {image: img, fit: [40, 40]},                      // Perfil
          {table: {widths: ['auto', 'auto'], body: stks}},  // Stocks
          {text: `${st}`, alignment: 'right'},              // Codigo
        ];
        tData.push(dd);
      }
    }
  };
  // Lineas en blanco
  doc.content.push('\n');
  // Agregar Table
  doc.content.push({
    table:
        {widths: ['auto', 'auto', '*', 'auto'], headerRows: 1, body: tData}
  });
  // Lineas en blanco
  doc.content.push('\n');
  // await toDataURL(`assets/perfiles/80x80/901.png`).toPromise();
  showPdf(doc);
}