import { NextResponse } from "next/server";
import net from "net";

export async function POST(req) {
  try {
    const { nombre, direccion, productos, total } = await req.json();

    const ipImpresora = "192.168.1.100"; // IP de tu impresora de delivery
    const puerto = 9100;

    const doble = "\x1D\x21\x11"; // Letra grande
    const normal = "\x1D\x21\x00";
    const cortar = "\x1D\x56\x00";

    let ticket = "";

    // Encabezado
    ticket += doble + "       DELIVERY\n";
    ticket += normal;
    ticket += `CLIENTE: ${nombre}\n`;
    ticket += `DIRECCIÓN: ${direccion}\n`;
    ticket += "------------------------------\n";

    productos.forEach((p) => {
      ticket += `1x ${p.nombre.toUpperCase()}\n`;
    });

    ticket += "------------------------------\n";
    ticket += `TOTAL: $${total.toFixed(2)}\n`;
    ticket += "\n\n\n";
    ticket += cortar;

    const socket = new net.Socket();
    socket.connect(puerto, ipImpresora, () => {
      socket.write(ticket, "binary", () => {
        socket.end();
      });
    });

    socket.on("error", (err) => {
      console.error("Error al imprimir en DELIVERY:", err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en /api/print/envios:", error);
    return NextResponse.json({ error: "Error de impresión" }, { status: 500 });
  }
}
