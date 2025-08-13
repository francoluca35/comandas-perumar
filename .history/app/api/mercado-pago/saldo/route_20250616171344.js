export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.mercadopago.com/v1/payments/search?status=approved&limit=100",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorBody = await res.json();
      console.error("Error body:", errorBody);
      throw new Error("Error en la respuesta de MercadoPago");
    }

    const data = await res.json();

    // Sumamos solo los pagos capturados y acreditados
    const totalDisponible = data.results
      .filter((pago) => pago.status_detail === "accredited")
      .reduce((acc, pago) => acc + pago.net_received_amount, 0);

    return new Response(JSON.stringify({ total: totalDisponible }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error MercadoPago:", error);
    return new Response(
      JSON.stringify({ error: "No se pudo obtener el saldo de MP" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
