import { NextResponse } from "next/server";
import net from "net";

export async function POST(req) {
  try {
    const { mesa, productos, orden, hora, fecha, metodoPago, ip } =
      await req.json();

    const impresoraIP = ip || "192.168.1.100"; // si no se especifica, usa la impresora principal
    const puerto = 9100;

    const doble = "\x1D\x21\x11"; // texto grande (2x)
    const normal = "\x1D\x21\x00"; // texto normal
    const cortar = "\x1D\x56\x00"; // cortar papel

    let ticket = "";

    // Encabezado grande
    ticket += doble;
    ticket += "     PERU MAR\n";
    ticket += `MESA: ${mesa}\n`;
    ticket += normal;

    // Info normal
    ticket += `ORDEN: ${orden}\n`;
    ticket += `HORA: ${hora}\n`;
    ticket += `FECHA: ${fecha}\n`;
    ticket += "==============================\n";

    // Productos
    for (const p of productos) {
      ticket += doble;
      ticket += `${p.cantidad}x ${p.nombre.toUpperCase()}\n`;
      ticket += normal;
    }

    ticket += "==============================\n";
    ticket += `PAGO: ${metodoPago?.toUpperCase() || "NO ESPECIFICADO"}\n`;

    // Saltos + corte
    ticket += "\n\n\n";
    ticket += cortar;

    // Envío a impresora
    const socket = new net.Socket();

    socket.connect(puerto, impresoraIP, () => {
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
