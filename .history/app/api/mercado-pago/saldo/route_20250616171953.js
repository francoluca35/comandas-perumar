export const runtime = "nodejs";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.mercadopago.com/v1/account/balance",
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Error en saldo:", errBody);
      throw new Error("No se pudo obtener el saldo");
    }

    const data = await response.json();

    return new Response(JSON.stringify({ total: data.available_balance }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error MercadoPago:", err);
    return new Response(JSON.stringify({ error: "No se pudo obtener saldo" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
