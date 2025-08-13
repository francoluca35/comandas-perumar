import { NextResponse } from "next/server";
import net from "net";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const { nombre, direccion, productos, total } = await req.json();

    const ipImpresora = "192.168.1.100";
    const puerto = 9100;

    const doble = "\x1D\x21\x11";
    const normal = "\x1D\x21\x00";
    const cortar = "\x1D\x56\x00";
    const separador = "------------------------------------------\n";

    // ✅ Leer logo convertido
    const logoPath = path.join(
      process.cwd(),
      "public",
      "Assets",
      "perumar_logo.escpos"
    );
    const logoBuffer = fs.readFileSync(logoPath);

    const generarTicket = () => {
      let ticket = "";

      ticket += logoBuffer.toString("binary"); // 🖼 Logo en binario
      ticket += "\n";
      ticket += doble + "      DELIVERY\n";
      ticket += doble + `      ${nombre.toUpperCase()}\n`;
      ticket += doble + `📍 ${direccion.toUpperCase()}\n`;
      ticket += normal;
      ticket += separador;

      productos.forEach((p) => {
        ticket += doble + `1x ${p.nombre.toUpperCase()}\n`;
        ticket += normal;
      });

      ticket += separador;
      ticket += `TOTAL: $${total.toFixed(2)}\n`;
      ticket += "\nGracias por su pedido!\n\n\n\n";
      ticket += cortar;

      return ticket;
    };

    const socket = new net.Socket();
    socket.connect(puerto, ipImpresora, () => {
      const ticket = generarTicket();
      socket.write(ticket, "binary", () => {
        // ✅ Imprimir 2 copias
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
