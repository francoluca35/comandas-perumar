const express = require("express");
const escpos = require("escpos");
escpos.USB = require("escpos-usb");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/print-ticket-pago", async (req, res) => {
  try {
    const { mesa, total, metodoPago } = req.body;
    const fecha = new Date().toLocaleDateString("es-AR");
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const device = new escpos.USB(); // Detecta la impresora USB incorporada
    const printer = new escpos.Printer(device);

    device.open(() => {
      printer
        .align("CT")
        .style("B")
        .size(1, 1)
        .text("🍽️ PERÚ MAR")
        .text(`Mesa: ${mesa}`)
        .text(`Fecha: ${fecha}`)
        .text(`Hora: ${hora}`)
        .text("------------------------------")
        .style("B")
        .size(2, 2)
        .text(`TOTAL: $${parseFloat(total).toFixed(2)}`)
        .style("B")
        .size(1, 1)
        .text(`Pago: ${metodoPago}`)
        .text("------------------------------")
        .text("Rivera 2495 V. Celina")
        .text("Tel: 1140660136")
        .text("Gracias por su visita!");

      if (metodoPago.toLowerCase() === "efectivo") {
        printer.cashdraw(); // 🔓 Abre la caja registradora por RJ11
      }

      printer.cut().close(); // corta el papel y cierra
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al imprimir:", err);
    res.status(500).json({ error: "No se pudo imprimir" });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🖨️ Servidor de impresión local en http://localhost:${PORT}`);
});
