const express = require("express");
const escpos = require("escpos");
escpos.Network = require("escpos-network");

const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.post("/print", (req, res) => {
  const { mesa, productos, total, metodoPago } = req.body;

  const device = new escpos.Network("192.168.1.100"); // ⚠ IP fija de la impresora
  const printer = new escpos.Printer(device);

  const fecha = new Date();
  const fechaFormateada = fecha.toLocaleDateString("es-AR");
  const horaFormateada = fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const orden = Date.now();

  device.open((err) => {
    if (err) {
      console.error("Error al conectar con impresora:", err);
      return res.status(500).send("Error al conectar");
    }

    printer
      .align("CT")
      .style("B")
      .size(1, 1)
      .text("🍽 Perú Mar")
      .text("")
      .text(`Mesa: ${mesa}`)
      .text(`Orden #: ${orden}`)
      .text(`Hora: ${horaFormateada}`)
      .text(`Fecha: ${fechaFormateada}`)
      .text("--------------------------------");

    productos.forEach((p) => {
      const linea = `${p.cantidad}x ${p.nombre}`;
      printer.text(linea);
    });

    printer.text("--------------------------------");
    printer.text(`TOTAL: $${total}`);
    printer.text(`PAGO: ${metodoPago}`);
    printer.text("\n\n\n");
    printer.cut().close();

    res.send("Ticket impreso correctamente");
  });
});

app.listen(4000, "0.0.0.0", () => {
  console.log("Servidor de impresión escuchando en puerto 4000");
});
