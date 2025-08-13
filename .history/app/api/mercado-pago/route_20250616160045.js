const express = require("express");
const mercadopago = require("mercadopago");

const router = express.Router();

// Configuramos Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

// Ruta para crear la preferencia de pago
router.post("/mercado-pago/crear-pago", async (req, res) => {
  const { total, mesa, nombreCliente } = req.body;

  try {
    const preference = {
      items: [
        {
          title: `Cobro Mesa ${mesa}`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: parseFloat(total),
        },
      ],
      payer: {
        name: nombreCliente,
      },
      back_urls: {
        success: "https://tusitio.com/success",
        failure: "https://tusitio.com/failure",
        pending: "https://tusitio.com/pending",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "Error al generar el pago" });
  }
});

module.exports = router;
