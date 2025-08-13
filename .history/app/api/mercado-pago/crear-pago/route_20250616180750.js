export const runtime = "nodejs";

import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { total, mesa, nombreCliente } = body;

    const preference = {
      items: [
        {
          id: `mesa-${mesa}`,
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
        success: "https://comandas-rose.vercel.app/tavolo",
        failure: "https://comandas-rose.vercel.app/tavolo",
        pending: "https://comandas-rose.vercel.app/tavolo",
      },
      auto_return: "approved",

      // 🔥 Este es el que nos permite buscar luego
      external_reference: mesa,
    };

    const response = await mercadopago.preferences.create(preference);

    return new Response(
      JSON.stringify({
        init_point: response.body.init_point,
        preference_id: response.body.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return new Response(JSON.stringify({ error: "Error al generar el pago" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
