export const runtime = "nodejs";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { total, mesa, nombreCliente } = body;

    const preference = {
      items: [
        {
          id: `mesa-${mesa}`,
          title: `Cobro Mesa ${mesa}`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: parseFloat(total),
        },
      ],
      external_reference: `mesa-${mesa}-${Date.now()}`,

      payer: { name: nombreCliente },
      notification_url:
        "https://perumar-app.vercel.app/api/mercado-pago/webhook", // 👈 Webhook aquí
      back_urls: {}, // ⚠️ No se redirige
      auto_return: undefined,
    };

    const response = await mercadopago.preferences.create(preference);

    return new Response(
      JSON.stringify({
        init_point: response.body.init_point,
        preference_id: response.body.id,
        external_reference: `mesa-${mesa}-${Date.now()}`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return new Response(JSON.stringify({ error: "Error al generar el pago" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
