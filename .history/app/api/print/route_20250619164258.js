import { NextResponse } from "next/server";
import net from "net";

export async function POST(req) {
  try {
    const { mesa, productos, orden, hora, fecha, metodoPago } =
      await req.json();

    const ip = "192.168.1.100"; // IP de tu impresora
    const puerto = 9100;

    const doble = "\x1D\x21\x11"; // 2x ancho y 2x alto
    const normal = "\x1D\x21\x00";
    const cortar = "\x1D\x56\x00"; // Cut paper ESC/POS

    let ticket = "";

    // Encabezado grande
    ticket += doble;
    ticket += "     PERU MAR\n";
    ticket += normal;

    ticket += `MESA: ${mesa}\n`;
    ticket += `ORDEN: ${orden}\n`;
    ticket += `HORA: ${hora}\n`;
    ticket += `FECHA: ${fecha}\n`;

    ticket += "==============================\n";

    // Productos en doble tamaño
    for (const p of productos) {
      ticket += doble;
      ticket += `${p.cantidad}x ${p.nombre.toUpperCase()}\n`;
      ticket += normal;
    }

    ticket += "==============================\n";
    ticket += `PAGO: ${metodoPago?.toUpperCase() || "NO ESPECIFICADO"}\n`;

    // Saltos de línea y corte
    ticket += "\n\n\n";
    ticket += cortar;

    const socket = new net.Socket();

    socket.connect(puerto, ip, () => {
      socket.write(ticket, "binary", () => {
        socket.end();
      });
    });

    socket.on("error", (err) => {
      console.error("Error al enviar a impresora:", err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en /api/print:", error);
    return NextResponse.json({ error: "Error en impresión" }, { status: 500 });
  }
}
