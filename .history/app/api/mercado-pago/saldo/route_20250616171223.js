export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.mercadopago.com/v1/payments/search?status=approved",
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

    // Sumamos el total de pagos aprobados
    const totalAprobado = data.results.reduce(
      (acc, pago) => acc + pago.transaction_amount,
      0
    );

    return new Response(JSON.stringify({ total: totalAprobado }), {
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
