export const runtime = "nodejs";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const payment = await mercadopago.payment.search({
      qs: {
        external_reference: id,
      },
    });

    const resultado = payment.body.results[0];
    const status = resultado ? resultado.status : "pending";

    return new Response(JSON.stringify({ status }), { status: 200 });
  } catch (err) {
    console.error("Error al obtener estado pago:", err);
    return new Response(
      JSON.stringify({ error: "Error al consultar estado" }),
      {
        status: 500,
      }
    );
  }
}
