import { CtasCtesProvider } from './../providers/ctas-ctes/ctas-ctes';
import { Pedido } from './../models/pedidos.clases';
import { Cliente } from './../models/clientes.clases';
import { ClientesProvider } from './../providers/clientes/clientes';
import { Reparto } from './../models/repartos.clases';
import { numFormat, dateFormat, formatTable, setInfo, showPdf } from "./config-comun";
import * as moment from 'moment';



export function printReparto(reparto: Reparto, clientesP: ClientesProvider, ctacteP: CtasCtesProvider) {
    let doc: any = {};
    let ClientesData: Array<{ Cliente: Cliente, saldo: number }> = [];
    let getData = async () => {
        for (let i = 0; i < reparto.Items.length; i++) {
            let id = reparto.Items[i].idCliente;
            if (ClientesData.findIndex((c) => { return c.Cliente.id == id; }) == -1) {
                clientesP.getOne(id).subscribe((cliente) => {
                    ctacteP.getSaldoCliente(cliente.id).subscribe((saldo) => {
                        ClientesData.push({ Cliente: cliente, saldo: saldo });
                    });
                });
            }
        }
    };
    getData();
    // Table lines config
    formatTable();
    setInfo(doc, `Reparto Nro: ${numFormat(reparto.id, '3.0-0')}`);
    doc.header = {
        columns: [
            [
                {
                    text: `Reparto Nro: ${numFormat(reparto.id, '3.0-0')}`,
                    margin: [50, 20],
                    alignment: 'left',
                    fontSize: 12,
                    bold: true
                }
            ],
            [
                {
                    text: `Fecha:${dateFormat(reparto.fecha, 'dd/MM/yyyy')}`,
                    margin: [50, 20],
                    alignment: 'right'
                }
            ]
        ]
    };
    doc.content = [];
    doc.content.push({ text: [{ text: 'Etiqueta: ', bold: true }, { text: `${reparto.nombre}` }] });
    doc.content.push({ text: [{ text: 'Chofer: ', bold: true }, { text: `${reparto.chofer}` }] });
    if (reparto.comentarios) {
        doc.content.push({ text: [{ text: 'Comentarios:', bold: true }, { text: `${reparto.comentarios}` }] });
    }
    doc.content.push('\n');
    let items: any[] = [];
    reparto.Items.forEach((i) => {
        let cd = ClientesData.find((c) => { return c.Cliente.id == i.idCliente; });
        items.push([{ text: `${numFormat(i.idCliente, '3.0-0')}-${cd.Cliente.nombre}` }, { text: `${numFormat(i.totalKilos, '1.2-2')}kg` }, { text: `${i.saldoActual}` }]);
        items.push([[{rowSpan:2,text:{ table: { body: [['Col1', 'Col2', 'Col3'], ['1', '2', '3'], ['1', '2', '3']] } }}],{},{}]);
    });
    doc.content.push({
        table: {
            body: items
        }
    });
    showPdf(doc);
}