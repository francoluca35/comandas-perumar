export const runtime = "nodejs";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=50",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Error HTTP:", response.status);
      throw new Error("No se pudo obtener los pagos");
    }

    const data = await response.json();

    const pagosAcreditados = data.results.filter(
      (pago) => pago.status === "approved"
    );

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
