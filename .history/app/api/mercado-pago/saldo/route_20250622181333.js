// app/api/mercado-pago/saldo/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN; // Usá una variable de entorno

    const res = await fetch("https://api.mercadopago.com/v1/account/balance", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Error al obtener el saldo de Mercado Pago");
    }

    const data = await res.json();
    return NextResponse.json({ saldo: data.available_balance || 0 });
  } catch (error) {
    console.error("Error API MercadoPago:", error);
    return NextResponse.json(
      { error: "Error al obtener el saldo" },
      { status: 500 }
    );
  }
}
