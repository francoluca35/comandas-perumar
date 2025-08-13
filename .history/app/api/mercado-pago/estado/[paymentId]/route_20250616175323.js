export const runtime = "nodejs";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function GET(req, { params }) {
  const { paymentId } = params;

  try {
    const payment = await mercadopago.payment.findById(paymentId);
    const estado = payment.body.status;

    return new Response(JSON.stringify({ estado }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al consultar pago:", error);
    return new Response(JSON.stringify({ error: "Error al consultar pago" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
