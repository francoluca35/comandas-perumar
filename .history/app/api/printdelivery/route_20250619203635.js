import { NextResponse } from "next/server";
import net from "net";

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
      tipo, // puede ser 'delivery' o 'entregalocal'
      fecha,
    } = await req.json();

    const parrilla = comidas.filter((p) =>
      p.comida?.toLowerCase().includes("pollo a la brasa")
    );
    const cocina = comidas.filter(
      (p) => !p.comida?.toLowerCase().includes("pollo a la brasa")
    );

    const titulo = tipo === "delivery" ? "🛍 PARA LLEVAR" : "🏠 MOSTRADOR";

    const enviarAImpresora = (productos, ip) => {
      return new Promise((resolve, reject) => {
        if (productos.length === 0) return resolve("Nada que imprimir");

        const doble = "\x1D\x21\x11";
        const normal = "\x1D\x21\x00";
        const cortar = "\x1D\x56\x00";

        let ticket = "";
        ticket += doble + "     PERU MAR\n";
        ticket += `${titulo}\n`;
        ticket += normal;
        ticket += `CLIENTE: ${nombre}\n`;
        ticket += `FECHA: ${fecha}\n`;
        ticket += "------------------------------\n";

        for (const p of productos) {
          ticket += doble;
          ticket += `1x ${
            p.comida?.toUpperCase() || p.bebida?.toUpperCase()
          }\n`;
          ticket += normal;
        }

        ticket += "------------------------------\n";
        ticket += `PAGO: ${formaDePago?.toUpperCase() || "NO ESPECIFICADO"}\n`;
        ticket += "\n\n\n" + cortar;

        const socket = new net.Socket();
        socket.connect(PUERTO, ip, () => {
          socket.write(ticket, "binary", () => {
            socket.end();
            resolve(`Impreso en ${ip}`);
          });
        });

        socket.on("error", (err) => {
          console.error(`Error en ${ip}:`, err);
          reject(err);
        });
      });
    };

    const resultados = await Promise.allSettled([
      enviarAImpresora(parrilla, IP_PARRILLA),
      enviarAImpresora(cocina, IP_COCINA),
    ]);

    return NextResponse.json({
      success: true,
      results: resultados.map((r) =>
        r.status === "fulfilled" ? r.value : r.reason.message
      ),
    });
  } catch (error) {
    console.error("Error en /api/printdelivery:", error);
    return NextResponse.json({ error: "Error en impresión" }, { status: 500 });
  }
}
