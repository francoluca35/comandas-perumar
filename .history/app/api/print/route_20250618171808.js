import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://c300-2800-810-545-8a39-b015-9da5-8663-a9cf.ngrok-free.app/print",
      {
        // ⚠ tu PC server
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.text();
    return NextResponse.json({ success: true, message: data });
  } catch (err) {
    console.error("Error proxy impresión:", err);
    return NextResponse.json(
      { error: "Error al conectar con el servidor de impresión" },
      { status: 500 }
    );
  }
}
