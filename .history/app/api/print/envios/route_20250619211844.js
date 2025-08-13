import { NextResponse } from "next/server";
import net from "net";

export async function POST(req) {
  try {
    const { nombre, direccion, productos, total } = await req.json();

    const ipImpresora = "192.168.1.100"; // IP de tu impresora
    const puerto = 9100;

    const doble = "\x1D\x21\x11"; // 2x tamaño
    const normal = "\x1D\x21\x00";
    const cortar = "\x1D\x56\x00";
    const separador = "------------------------------------------\n";

    const generarTicket = () => {
      let ticket = "";

      ticket += normal + "        🛵 DELIVERY\n";
      ticket += doble + "       Perú Mar\n";
      ticket += "\n";

      ticket += doble + `Cliente: ${nombre.toUpperCase()}\n`;
      ticket += doble + `Direccion: ${direccion.toUpperCase()}\n`;
      ticket += normal + separador;

      productos.forEach((p) => {
        ticket += doble + `1x ${p.nombre.toUpperCase()}\n`;
      });

      ticket += normal + separador;
      ticket += `TOTAL: $${total.toFixed(2)}\n`;

      ticket += "\nGracias por su pedido!\n";
      ticket += "\n\n\n";
      ticket += cortar;
      return ticket;
    };

    const socket = new net.Socket();
    socket.connect(puerto, ipImpresora, () => {
      const ticket = generarTicket() + generarTicket(); // 🧾 Dos copias
      socket.write(ticket, "binary", () => {
        socket.end();
      });
    });

    socket.on("error", (err) => {
      console.error("Error de impresión:", err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en /api/print/envios:", error);
    return NextResponse.json({ error: "Error de impresión" }, { status: 500 });
  }
}
