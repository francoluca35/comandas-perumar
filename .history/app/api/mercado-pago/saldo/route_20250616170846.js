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
      console.error("Error HTTP:", response.status);
      throw new Error("No se pudo obtener el saldo");
    }

    const data = await response.json();

    return new Response(JSON.stringify({ total: data.available_balance }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener saldo de Mercado Pago:", error);
    return new Response(JSON.stringify({ error: "Error al obtener saldo" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
