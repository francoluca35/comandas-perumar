export const runtime = "nodejs";
import mercadopago from "mercadopago";

// Configuración MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function GET() {
  try {
    // Traemos movimientos (primeros 50 movimientos)
    const response = await mercadopago.get("/v1/account/movements", {
      params: {
        limit: 50, // podemos aumentar este límite si querés sumar más
      },
    });

    const movimientos = response.data.results;

    // Filtramos solo los pagos acreditados
    const pagosAcreditados = movimientos.filter(
      (mov) => mov.type === "payment" && mov.status === "accredited"
    );

    const total = pagosAcreditados.reduce((acc, mov) => acc + mov.amount, 0);

    return new Response(JSON.stringify({ total }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener saldo real de MercadoPago:", error);
    return new Response(JSON.stringify({ error: "Error al obtener saldo" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
