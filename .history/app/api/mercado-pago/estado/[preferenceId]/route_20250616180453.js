export const runtime = "nodejs";

import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function GET(req, context) {
  const { preferenceId } = context.params;

  try {
    const searchResult = await mercadopago.payment.search({
      qs: {
        external_reference: preferenceId,
      },
    });

    const payment = searchResult.body.results[0];
    const status = payment?.status || "pending";

    return new Response(JSON.stringify({ status }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al consultar estado:", error);
    return new Response(
      JSON.stringify({ error: "Error al consultar estado" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
