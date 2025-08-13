import { NextResponse } from "next/server";
import net from "net";

export async function POST(req) {
  try {
    const { mesa, productos, orden, hora, fecha, metodoPago } =
      await req.json();

    const ip = "192.168.1.100"; // IP de tu impresora
    const puerto = 9100;

    const doble = "\x1D\x21\x11"; // 2x ancho y 2x alto
    const reset = "\x1D\x21\x00";
    const cortar = "\x1D\x56\x00"; // Cut paper

    let ticket = "";

    ticket += doble;
    ticket += "     PERU MAR\n";
    ticket += reset;

    ticket += `MESA: ${mesa}\n`;
    ticket += `ORDEN: ${orden}\n`;
    ticket += `HORA: ${hora}\n`;
    ticket += `FECHA: ${fecha}\n`;
    ticket += "------------------------------\n";

    for (const p of productos) {
      ticket += `${p.cantidad}x ${p.nombre.toUpperCase()}\n`;
    }

    ticket += "------------------------------\n";
    ticket += `PAGO: ${metodoPago || "No especificado"}\n`;
    ticket += "******************************\n";
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
