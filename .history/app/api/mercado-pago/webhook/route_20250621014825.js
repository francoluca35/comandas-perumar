export const runtime = "nodejs";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    const tipo = body.type || body.action;
    const paymentId = body.data?.id;

    if (tipo === "payment" && paymentId) {
      const payment = await mercadopago.payment.findById(paymentId);

      if (payment.body.status === "approved") {
        console.log("✅ PAGO CONFIRMADO (vía webhook):", paymentId);

        // 🔁 Acá podés:
        // - guardar el pago en tu base de datos
        // - imprimir el ticket llamando a una API interna
        // - marcar la mesa como libre

        // Ejemplo:
        // await fetch("http://localhost:4000/imprimir-ticket", {...});
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return new Response("Error interno", { status: 500 });
  }
}
