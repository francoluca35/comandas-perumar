import { NextResponse } from "next/server";
import net from "net";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const { nombre, direccion, productos, total } = await req.json();

    const ipImpresora = "192.168.1.100"; // IP de la impresora
    const puerto = 9100;

    const doble = "\x1D\x21\x11";
    const normal = "\x1D\x21\x00";
    const cortar = "\x1D\x56\x00";
    const separador = "------------------------------------------\n";

    const generarTicket = () => {
      let ticket = "";

      ticket += normal + "        🛵 DELIVERY\n";
      ticket += doble + `      Perú Mar\n` + normal;
      ticket += `Cliente: ${nombre}\n`;
      ticket += `Dirección: ${direccion}\n`;
      ticket += separador;

      productos.forEach((p) => {
        ticket += `1x ${p.nombre.toUpperCase()}\n`;
      });

      ticket += separador;
      ticket += `TOTAL: $${total.toFixed(2)}\n`;

      ticket += "\nGracias por su pedido!\n\n\n\n";
      ticket += separador;
      ticket += separador;
      ticket += separador;
      ticket += separador;
      ticket += separador;
      ticket += cortar;
      return ticket;
    };

    const socket = new net.Socket();
    socket.connect(puerto, ipImpresora, () => {
      const ticket = generarTicket() + generarTicket(); // 🧾 dos copias
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
