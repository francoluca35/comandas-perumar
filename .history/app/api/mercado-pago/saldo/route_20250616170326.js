export const runtime = "nodejs";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function GET() {
  try {
    const response = await mercadopago.get("/v1/payments/search", {
      params: {
        sort: "date_created",
        criteria: "desc",
        limit: 50,
      },
    });

    const pagos = response.data.results;

    const pagosAcreditados = pagos.filter((pago) => pago.status === "approved");

    const total = pagosAcreditados.reduce(
      (acc, pago) => acc + pago.transaction_amount,
      0
    );

    return new Response(JSON.stringify({ total }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return new Response(JSON.stringify({ error: "Error al obtener pagos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
