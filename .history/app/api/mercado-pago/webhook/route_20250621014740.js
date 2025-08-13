// archivo: app/api/mercado-pago/webhook/route.js

export const runtime = "nodejs";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    const paymentId = body.data?.id;

    if (paymentId) {
      const payment = await mercadopago.payment.findById(paymentId);

      if (payment.body.status === "approved") {
        // Aquí hacés todo: guardar, imprimir, etc.
        console.log("✅ Pago confirmado vía webhook");

        // Podés disparar la impresión con una request a tu backend local si lo tenés preparado
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return new Response("Error interno", { status: 500 });
  }
}
