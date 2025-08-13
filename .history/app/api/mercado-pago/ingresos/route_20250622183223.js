// app/api/mercado-pago/ingresos/route.js
import { NextResponse } from "next/server";
import { formatISO, startOfDay } from "date-fns";

export async function GET() {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    const desde = formatISO(startOfDay(new Date())); // Ej: 2025-06-22T00:00:00-03:00

    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&begin_date=...&limit=1000
`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();
    const pagos = data.results || [];

    const pagosAprobados = pagos.filter((p) => p.status === "approved");

    const total = pagosAprobados.reduce(
      (acc, pago) => acc + pago.transaction_amount,
      0
    );

    const ultimoPago = pagosAprobados[0] || null;

    const resultado = {
      ingresosHoy: total,
      cantidadPagos: pagosAprobados.length,
      ultimoPago: ultimoPago
        ? {
            monto: ultimoPago.transaction_amount,
            fecha: ultimoPago.date_created,
            cliente: ultimoPago.payer?.first_name || "Cliente sin nombre",
            metodo: ultimoPago.payment_method_id || "desconocido",
          }
        : null,
    };

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error obteniendo ingresos MP:", error.message);
    return NextResponse.json(
      { error: "Error al obtener ingresos de Mercado Pago" },
      { status: 500 }
    );
  }
}
