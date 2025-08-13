export const runtime = "nodejs";

import mercadopago from "mercadopago";

// Configuramos Mercado Pago (produción o test según tu access_token)
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    // Capturamos el body correctamente (sea JSON o urlencoded)
    const rawBody = await req.text();
    let body;

    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      // Si no es JSON, intentamos parsear como URLSearchParams
      body = Object.fromEntries(new URLSearchParams(rawBody));
    }

    const type = body.type || body.topic || body.action;
    const paymentId = body.data?.id || body["data.id"] || body.id;

    console.log("Webhook recibido:", body);

    if (type === "payment" && paymentId) {
      const payment = await mercadopago.payment.findById(paymentId);

      const status = payment.body.status;
      const amount = payment.body.transaction_amount;
      const mesa =
        payment.body.additional_info?.items?.[0]?.title ?? "Desconocida";

      console.log("Pago confirmado:", { status, amount, mesa });

      if (status === "approved") {
        // Actualizamos tu caja
        await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/cobro-mercadopago`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              totalPedido: amount,
              mesa: mesa,
            }),
          }
        );
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Error en webhook:", err);
    return new Response("Error interno", { status: 500 });
  }
}
