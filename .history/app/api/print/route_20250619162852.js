// app/api/print/route.js
import { NextResponse } from "next/server";
import net from "net";

export async function POST(req) {
  try {
    const { mesa, productos, total, metodoPago } = await req.json();

    const fecha = new Date().toLocaleDateString("es-AR");
    const hora = new Date().toLocaleTimeString("es-AR");

    let ticket = `
      Perú Mar
Mesa: ${mesa}
Fecha: ${fecha}
Hora: ${hora}
--------------------------------
`;

    productos.forEach((p) => {
      ticket += `${p.cantidad}x ${p.nombre}\n`;
    });

    ticket += `--------------------------------
Total: $${total.toFixed(2)}
Pago: ${metodoPago || "Pendiente"}
Gracias por su visita!\n\n\n`;

    const printerIP = "192.168.1.100";
    const printerPort = 9100;

    const socket = new net.Socket();

    await new Promise((resolve, reject) => {
      socket.connect(printerPort, printerIP, () => {
        socket.write(ticket, () => {
          socket.end();
          resolve();
        });
      });

      socket.on("error", (err) => {
        reject(err);
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error enviando a la impresora:", error);
    return NextResponse.json(
      { error: "No se pudo imprimir el ticket" },
      { status: 500 }
    );
  }
}
