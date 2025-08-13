import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE(req) {
  try {
    const { codigos } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    const mesasDoc = await db.collection("tables").findOne({});

    const nuevasAdentro = mesasDoc.mesaAdentro.filter(
      (m) => !codigos.includes(m.codigo)
    );
    const nuevasAfuera = mesasDoc.mesaAfuera.filter(
      (m) => !codigos.includes(m.codigo)
    );

    await db.collection("tables").updateOne(
      { _id: mesasDoc._id },
      {
        $set: {
          mesaAdentro: nuevasAdentro,
          mesaAfuera: nuevasAfuera,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando mesas:", error);
    return NextResponse.json(
      { error: "Error al eliminar mesas" },
      { status: 500 }
    );
  }
}
