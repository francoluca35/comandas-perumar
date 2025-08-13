// app/api/imprimir-ticket/route.js

import { NextResponse } from "next/server";
import escpos from "escpos";
import escposUSB from "escpos-usb";

// Siempre esto para USB
escpos.USB = escposUSB;

export async function POST(req) {
  try {
    const data = await req.json();

    const { mesa, productos, total, metodoPago } = data;

    const device = new escpos.USB(); // detecta el primer USB conectado
    const printer = new escpos.Printer(device);

    const fecha = new Date().toLocaleDateString("es-AR");
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    device.open(() => {
      printer
        .align("CT")
        .style("B")
        .size(1, 1)
        .text("🍽 Perú Mar")
        .text(`Mesa: ${mesa}`)
        .text(`Fecha: ${fecha} ${hora}`)
        .drawLine();

      productos.forEach((p) => {
        printer.text(`${p.cantidad}x ${p.nombre}`);
      });

      printer
        .drawLine()
        .align("RT")
        .text(`Total: $${total.toFixed(2)}`)
        .text(`Pago: ${metodoPago}`)
        .feed(2)
        .cut()
        .close();
    });

    return NextResponse.json({ message: "Impreso OK" });
  } catch (err) {
    console.error("Error al imprimir:", err);
    return NextResponse.json({ error: "Error al imprimir" }, { status: 500 });
  }
}
