export const runtime = "nodejs";

import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Solo nos interesa cuando es un pago
    if (type === "payment") {
      const payment = await mercadopago.payment.findById(data.id);
      const status = payment.body.status;
      const amount = payment.body.transaction_amount;
      const orderId = payment.body.order.id;
      const mesa =
        payment.body.additional_info?.items?.[0]?.title ?? "Desconocida";

      console.log("Pago recibido:", { status, amount, mesa });

      if (status === "approved") {
        // 👉 Acá actualizás tu caja, sumás el ingreso y liberás la mesa

        // Por ejemplo:
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
    return new Response("Error", { status: 500 });
  }
}
