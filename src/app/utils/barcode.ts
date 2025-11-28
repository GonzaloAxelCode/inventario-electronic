declare let require: any;
const JsBarcode = require('jsbarcode');

export function generarBarcode(
    element: HTMLImageElement,
    codigo: string
) {
    JsBarcode(element, codigo, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 50,
        displayValue: true,
        fontOptions: "",
        font: "monospace",
        text: undefined,
        textAlign: "center",
        textPosition: "top",
        textMargin: 2,
        fontSize: 15,
        background: "#ffffff",
        margin: 10,
        marginTop: undefined,
        marginBottom: undefined,
        marginLeft: undefined,
        marginRight: 0,
        flat: false,

    });

}
