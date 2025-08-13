import { NextResponse } from "next/server";
import net from "net";

export async function POST(req) {
  try {
    const { nombre, direccion, productos, total } = await req.json();

    const ipImpresora = "192.168.1.100"; // IP de tu impresora térmica
    const puerto = 9100;

    const doble = "\x1D\x21\x11"; // 2x ancho y 2x alto
    const normal = "\x1D\x21\x00";
    const cortar = "\x1D\x56\x00";

    // Función generadora de ticket con formato
    const generarTicket = () => {
      let ticket = "";

      // Título
      ticket += doble;
      ticket += "       DELIVERY\n";
      ticket += normal;

      ticket += `CLIENTE: ${nombre}\n`;
      ticket += `DIRECCIÓN: ${direccion}\n`;
      ticket += "--------------------------------\n";

      productos.forEach((p) => {
        ticket += `1x ${p.nombre.toUpperCase()}\n`;
      });

      ticket += "--------------------------------\n";
      ticket += `TOTAL: $${total.toFixed(2)}\n`;

      // Teléfono / Despedida
      ticket += "--------------------------------\n";
      ticket += "Tel: 1140660136\n";
      ticket += "Dirección: Rivera 2525 V. Celina\n";
      ticket += "Gracias por su compra!\n";

      // Espacios y corte
      ticket += "\n\n\n";
      ticket += cortar;
      return ticket;
    };

    const ticketFinal = generarTicket() + generarTicket(); // Dos tickets

    const socket = new net.Socket();
    socket.connect(puerto, ipImpresora, () => {
      socket.write(ticketFinal, "binary", () => {
        socket.end();
      });
    });

    socket.on("error", (err) => {
      console.error("Error al imprimir:", err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en /api/print/envios:", error);
    return NextResponse.json({ error: "Error en impresión" }, { status: 500 });
  }
}
