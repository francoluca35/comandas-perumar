import { NextResponse } from "next/server";
import net from "net";

const IP_COCINA = "192.168.0.100";

const IP_PARRILLA = "192.168.0.101";
const PUERTO = 9100;

export async function POST(req) {
  try {
    const { mesa, productos, orden, hora, fecha, metodoPago } =
      await req.json();
    // Separar por sector
    const parrilla = productos.filter((p) =>
      p.nombre.toLowerCase().includes("pollo a la brasa")
    );
    const cocina = productos.filter(
      (p) => !p.nombre.toLowerCase().includes("pollo a la brasa")
    );

    // Función para generar y enviar ticket a una IP
    const enviarAImpresora = (productos, ip) => {
      return new Promise((resolve, reject) => {
        if (productos.length === 0) return resolve("Nada que imprimir");

        const doble = "\x1D\x21\x11";
        const normal = "\x1D\x21\x00";
        const cortar = "\x1D\x56\x00";

        let ticket = "";
        ticket += doble;
        ticket += "     PERU MAR\n";
        ticket += `MESA: ${mesa}\n`;
        ticket += normal;
        ticket += `ORDEN: ${orden}\n`;
        ticket += `HORA: ${hora}\n`;
        ticket += `FECHA: ${fecha}\n`;
        ticket += "==============================\n";

        for (const p of productos) {
          ticket += doble;
          ticket += `${p.cantidad}x ${p.nombre.toUpperCase()}\n`;
          ticket += normal;
        }

        ticket += "==============================\n";
        ticket += `PAGO: ${metodoPago?.toUpperCase() || "NO ESPECIFICADO"}\n`;
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

    // Intentar imprimir en ambas impresoras
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
    console.error("Error en /api/print:", error);
    return NextResponse.json({ error: "Error en impresión" }, { status: 500 });
  }
}
