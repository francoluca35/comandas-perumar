export const runtime = "nodejs";

import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function GET() {
  try {
    const response = await mercadopago.merchantOrders.search({
      qs: {
        order_status: "paid",
      },
    });

    const pagos = response.body.results;

    // Sumamos todos los montos acreditados
    const saldo = pagos.reduce((acc, pago) => acc + pago.total_amount, 0);

    return new Response(JSON.stringify({ saldo }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error al obtener saldo:", err);
    return new Response(JSON.stringify({ error: "Error al consultar saldo" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
