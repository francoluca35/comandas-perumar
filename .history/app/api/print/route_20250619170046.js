import { NextResponse } from "next/server";
import net from "net";

export async function POST(req) {
  try {
    const { mesa, productos, orden, hora, fecha, metodoPago } =
      await req.json();

    // Dividir productos
    const parrilla = productos.filter((p) =>
      p.nombre.toLowerCase().includes("pollo a la brasa")
    );
    const cocina = productos.filter(
      (p) => !p.nombre.toLowerCase().includes("pollo a la brasa")
    );

    // Imprimir en ambas si hay contenido
    if (cocina.length) {
      await enviarAImpresora({
        ip: "192.168.1.100", // Impresora cocina
        productos: cocina,
        mesa,
        orden,
        hora,
        fecha,
        metodoPago,
      });
    }

    if (parrilla.length) {
      await enviarAImpresora({
        ip: "10.10.100.254", // Impresora parrilla
        productos: parrilla,
        mesa,
        orden,
        hora,
        fecha,
        metodoPago,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error general en impresión:", error);
    return NextResponse.json({ error: "Fallo al imprimir" }, { status: 500 });
  }
}

async function enviarAImpresora({
  ip,
  productos,
  mesa,
  orden,
  hora,
  fecha,
  metodoPago,
}) {
  const socket = new net.Socket();
  const puerto = 9100;

  const doble = "\x1D\x21\x11"; // 2x ancho y 2x alto
  const normal = "\x1D\x21\x00";
  const cortar = "\x1D\x56\x00";

  let ticket = "";

  // Encabezado
  ticket += doble + "     PERU MAR\n";
  ticket += `MESA: ${mesa}\n` + normal;
  ticket += `ORDEN: ${orden}\n`;
  ticket += `HORA: ${hora}\n`;
  ticket += `FECHA: ${fecha}\n`;
  ticket += "------------------------------\n";

  for (const p of productos) {
    ticket += doble;
    ticket += `${p.cantidad}x ${p.nombre.toUpperCase()}\n`;
    ticket += normal;
  }

  ticket += "------------------------------\n";
  ticket += `PAGO: ${metodoPago?.toUpperCase() || "NO ESPECIFICADO"}\n`;
  ticket += "\n\n\n";
  ticket += cortar;

  return new Promise((resolve, reject) => {
    socket.connect(puerto, ip, () => {
      socket.write(ticket, "binary", () => {
        socket.end();
        resolve();
      });
    });

    socket.on("error", (err) => {
      console.error(`Error al imprimir en IP ${ip}:`, err);
      reject(err);
    });
  });
}
