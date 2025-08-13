import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { codigo, usuario, hora, estado } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("tables").updateOne(
      { codigo },
      {
        $set: {
          usuario,
          hora,
          estado,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando mesa:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
