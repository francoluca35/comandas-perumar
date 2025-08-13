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
        const externalReference = payment.body.external_reference;
        const monto = payment.body.transaction_amount;
        const metodo = payment.body.payment_method_id;

        // 🔁 Llamamos a tu API local que imprime el ticket
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/imprimir-ticket`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mesa: externalReference,
            total: monto,
            metodoPago: metodo,
          }),
        });

        console.log("✅ Pago confirmado. Ticket enviado a impresión.");
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return new Response("Error interno", { status: 500 });
  }
}
