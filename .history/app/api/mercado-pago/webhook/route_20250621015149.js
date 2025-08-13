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

        await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/pago/webhook-confirmacion`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mesa: payment.body.external_reference.replace("mesa-", ""),
              total: payment.body.transaction_amount,
              metodo: "Mercado Pago",
              nombreCliente: payment.body.payer?.name || "Cliente",
            }),
          }
        );
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return new Response("Error interno", { status: 500 });
  }
}
