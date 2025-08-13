export const runtime = "nodejs";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.mercadopago.com/v1/account/balance",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Error body:", errorBody);
      throw new Error("Error en la respuesta de MercadoPago");
    }

    const data = await response.json();

    return new Response(JSON.stringify({ total: data.available_balance }), {
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
