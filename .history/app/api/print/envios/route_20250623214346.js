import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://e527-181-47-132-221.ngrok-free.app/print-delivery", // Ruta específica del servidor local
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.text();
    return NextResponse.json({ success: true, message: data });
  } catch (err) {
    console.error("Error al conectar con servidor local:", err);
    return NextResponse.json(
      { error: "Error al imprimir desde Vercel" },
      { status: 500 }
    );
  }
}
