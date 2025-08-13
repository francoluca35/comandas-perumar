import { NextResponse } from "next/server";
import net from "net";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const { nombre, direccion, productos, total } = await req.json();

    const ipImpresora = "192.168.1.100"; // IP impresora DELIVERY
    const puerto = 9100;

    const reset = "\x1B\x40";
    const centrado = "\x1B\x61\x01";
    const izquierda = "\x1B\x61\x00";
    const doble = "\x1D\x21\x11";
    const normal = "\x1D\x21\x00";
    const cortar = "\x1D\x56\x00";
    const separador = "------------------------------------------\n";

    const logoPath = path.join(
      process.cwd(),
      "public",
      "Assets",
      "perumar_logo.escpos"
    );
    const logoBuffer = fs.readFileSync(logoPath);

    const generarTicket = () => {
      let ticket = "";

      ticket += reset;
      ticket += centrado;
      ticket += logoBuffer.toString("binary");
      ticket += "\n";

      ticket += doble + "DELIVERY\n";
      ticket += normal;

      ticket += doble + `${nombre.toUpperCase()}\n`;
      ticket += normal;

      ticket += doble + `📍 ${direccion.toUpperCase()}\n`;
      ticket += normal;

      ticket += separador;

      productos.forEach((p) => {
        ticket += doble + `1x ${p.nombre.toUpperCase()}\n`;
        ticket += normal;
      });

      ticket += separador;
      ticket += doble + `TOTAL: $${total.toFixed(2)}\n`;
      ticket += normal;

      ticket += "\nGracias por su pedido!\n\n\n";
      ticket += cortar;

      return ticket;
    };

    const socket = new net.Socket();
    socket.connect(puerto, ipImpresora, () => {
      const ticket = generarTicket();
      socket.write(ticket, "binary", () => {
        // Imprime 2 copias
        socket.write(ticket, "binary", () => {
          socket.end();
        });
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
