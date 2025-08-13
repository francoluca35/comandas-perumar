export const runtime = "nodejs";

import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function GET() {
  try {
    const pagos = await mercadopago.payment.search({
      qs: { status: "approved" },
    });

    const total = pagos.body.results.reduce(
      (acc, pago) => acc + (pago.transaction_amount || 0),
      0
    );

    return new Response(JSON.stringify({ total }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al consultar MercadoPago:", error);
    return new Response(JSON.stringify({ error: "Error al consultar MP" }), {
      status: 500,
    });
  }
}
