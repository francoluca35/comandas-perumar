import { NextResponse } from "next/server";
import net from "net";

const IP_COCINA = "192.168.1.100";
const IP_PARRILLA = "192.168.1.101";
const PUERTO = 9100;

export async function POST(req) {
  try {
    const { mesa, productos, orden, hora, fecha, metodoPago } =
      await req.json();

    const parrilla = productos.filter((p) =>
      p.nombre?.toLowerCase().includes("pollo a la brasa")
    );
    const cocina = productos.filter(
      (p) => !p.nombre?.toLowerCase().includes("pollo a la brasa")
    );

    const enviarAImpresora = (items, ip) => {
      return new Promise((resolve, reject) => {
        if (items.length === 0) return resolve("Nada que imprimir");

        const doble = "\x1D\x21\x11";
        const normal = "\x1D\x21\x00";
        const cortar = "\x1D\x56\x00";

        let ticket = "";
        ticket += doble + "     PERU MAR\n";
        ticket += `MESA: ${mesa}\n`;
        ticket += normal;
        ticket += `ORDEN: ${orden}\nHORA: ${hora}\nFECHA: ${fecha}\n`;
        ticket += "==============================\n";

        for (const p of items) {
          const nombre = p.nombre;
          const cantidad = p.cantidad || 1;
          ticket += doble + `${cantidad}x ${nombre.toUpperCase()}\n` + normal;
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
