import { NextResponse } from "next/server";
import net from "net";

// IPs de las impresoras
const IP_COCINA = "192.168.1.100";
const IP_PARRILLA = "192.168.1.101";
const PUERTO = 9100;

export async function POST(req) {
  try {
    const {
      nombre,
      comidas,
      formaDePago,
      total,
      tipo, // "entregalocal" o "mostrador"
      fecha,
    } = await req.json();

    const parrilla = comidas.filter((c) =>
      (c.comida || c.bebida || "").toLowerCase().includes("pollo a la brasa")
    );

    const cocina = comidas.filter(
      (c) =>
        !(c.comida || c.bebida || "").toLowerCase().includes("pollo a la brasa")
    );

    const generarTicket = (productos, ip) => {
      return new Promise((resolve, reject) => {
        if (productos.length === 0) return resolve("Nada que imprimir");

        const doble = "\x1D\x21\x11";
        const normal = "\x1D\x21\x00";
        const cortar = "\x1D\x56\x00";

        let ticket = "";

        ticket += doble + "    PERU MAR\n";
        ticket += normal + `CLIENTE: ${nombre.toUpperCase()}\n`;
        ticket += `MODALIDAD: ${
          tipo === "entregalocal" ? "MOSTRADOR" : "PARA LLEVAR"
        }\n`;
        ticket += `FECHA: ${fecha}\n`;
        ticket += "------------------------------\n";

        for (const p of productos) {
          const nombreItem = p.comida || p.bebida;
          ticket += doble + `• ${nombreItem.toUpperCase()}\n` + normal;
        }

        ticket += "------------------------------\n";
        ticket += `PAGO: ${formaDePago.toUpperCase()}\n`;
        ticket += "\n\n\n" + cortar;

        const socket = new net.Socket();
        socket.connect(PUERTO, ip, () => {
          socket.write(ticket, "binary", () => {
            socket.end();
            resolve(`Impreso en ${ip}`);
          });
        });

        socket.on("error", (err) => {
          console.error(`Error al imprimir en ${ip}:`, err);
          reject(err);
        });
      });
    };

    const resultados = await Promise.allSettled([
      generarTicket(parrilla, IP_PARRILLA),
      generarTicket(cocina, IP_COCINA),
    ]);

    return NextResponse.json({
      success: true,
      resultados: resultados.map((r) =>
        r.status === "fulfilled" ? r.value : r.reason.message
      ),
    });
  } catch (error) {
    console.error("Error en /api/printdelivery:", error);
    return NextResponse.json(
      { error: "Error al imprimir delivery" },
      { status: 500 }
    );
  }
}
