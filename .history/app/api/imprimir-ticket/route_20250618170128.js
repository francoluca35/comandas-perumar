import escpos from "escpos";
import escposUSB from "escpos-usb";

escpos.USB = escposUSB;

export async function POST(req) {
  try {
    const body = await req.json();
    const { mesa, productos, total, metodoPago } = body;

    const fecha = new Date().toLocaleDateString("es-AR");
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    device.open(() => {
      printer
        .align("CT")
        .image("./public/Assets/logo-oficial.png", "s8") // <- si querés logo físico en ticket (opcional)
        .then(() => {
          printer
            .text("PERÚ MAR")
            .text(`Mesa: ${mesa}`)
            .text(`Fecha: ${fecha} ${hora}`)
            .drawLine();

          productos.forEach((p) => {
            printer.text(
              `${p.cantidad}x ${p.nombre}  $${(p.precio * p.cantidad).toFixed(
                2
              )}`
            );
          });

          printer
            .drawLine()
            .text(`TOTAL: $${total.toFixed(2)}`)
            .text(`Método: ${metodoPago}`)
            .feed(2)
            .cut()
            .close();
        });
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Error al imprimir:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
