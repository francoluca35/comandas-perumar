import { NextResponse } from "next/server";
import net from "net";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const { nombre, direccion, productos, total, metodoPago } =
      await req.json();

    const IP_COCINA = "192.168.0.100"; // ← actualizado

    const IP_PARRILLA = "192.168.1.101";
    const PUERTO = 9100;

    const reset = "\x1B\x40";
    const centrado = "\x1B\x61\x01";
    const normal = "\x1D\x21\x00";
    const doble = "\x1D\x21\x11";
    const cortar = "\x1D\x56\x00";
    const separador = "------------------------------------------\n";

    const logoPath = path.join(
      process.cwd(),
      "public",
      "Assets",
      "perumar_logo.escpos"
    );
    const logoBuffer = fs.readFileSync(logoPath);

    const generarTicket = (productos, esParrilla = false) => {
      let ticket = "";

      ticket += reset;
      ticket += centrado;
      ticket += logoBuffer.toString("binary") + "\n";

      ticket += doble + "DELIVERY\n\n";
      ticket += normal;

      ticket += `Nombre: ${nombre.toUpperCase()}\n`;
      ticket += `Dirección: ${direccion.toUpperCase()}\n`;
      ticket += `Forma de pago: ${
        metodoPago?.toUpperCase() || "NO ESPECIFICADO"
      }\n`;

      ticket += "\n" + separador;

      productos.forEach((p) => {
        ticket += doble + `1x ${p.nombre.toUpperCase()}\n`;
        ticket += normal;
      });

      ticket += separador;
      ticket += doble + `TOTAL: $${total.toFixed(2)}\n`;
      ticket += normal;

      ticket += "\nTel: 1140660136\n";
      ticket += "Dirección: Rivera 2495 V. Celina\n";
      ticket += "\nGracias por su pedido!\n\n\n";
      ticket += "\n\n\n\n";
      ticket += cortar;

      return ticket;
    };

    const parrilla = productos.filter((p) =>
      p.nombre.toLowerCase().includes("pollo a la brasa")
    );
    const cocina = productos.filter(
      (p) => !p.nombre.toLowerCase().includes("pollo a la brasa")
    );

    const enviar = (productos, ip, esParrilla = false) => {
      return new Promise((resolve, reject) => {
        if (productos.length === 0)
          return resolve("Sin productos para imprimir.");

        const socket = new net.Socket();
        socket.connect(PUERTO, ip, () => {
          const ticket = generarTicket(productos, esParrilla);
          // Imprimir dos copias
          socket.write(ticket, "binary", () => {
            socket.write(ticket, "binary", () => {
              socket.end();
              resolve(`Impreso en ${ip}`);
            });
          });
        });

        socket.on("error", (err) => {
          console.error(`Error al imprimir en ${ip}:`, err);
          reject(err);
        });
      });
    };

    const resultados = await Promise.allSettled([
      enviar(parrilla, IP_PARRILLA, true),
      enviar(cocina, IP_COCINA),
    ]);

    return NextResponse.json({
      success: true,
      results: resultados.map((r) =>
        r.status === "fulfilled" ? r.value : r.reason.message
      ),
    });
  } catch (error) {
    console.error("Error en /api/print/envios:", error);
    return NextResponse.json({ error: "Error de impresión" }, { status: 500 });
  }
}
