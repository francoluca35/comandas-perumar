export const runtime = "nodejs";

import { actualizarCaja } from "@/lib/caja"; // Asumiendo que tenés esto o armamos uno

export async function POST(req) {
  try {
    const body = await req.json();
    const { totalPedido, mesa } = body;

    // 👉 Sumás el dinero a tu caja registradora
    await actualizarCaja(totalPedido);

    // 👉 Liberás la mesa
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mesas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: mesa,
        productos: [],
        metodoPago: "MercadoPago",
        total: 0,
        estado: "libre",
        hora: "",
        fecha: "",
      }),
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Error actualizando caja:", err);
    return new Response("Error", { status: 500 });
  }
}
