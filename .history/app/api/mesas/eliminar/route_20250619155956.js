import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE(req) {
  try {
    const { tipo, cantidad } = await req.json();

    if (
      !tipo ||
      !["mesaAdentro", "mesaAdentro2", "mesaAfuera"].includes(tipo)
    ) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    if (!cantidad || typeof cantidad !== "number" || cantidad <= 0) {
      return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const mesasDoc = await db.collection("tables").findOne({});
    if (!mesasDoc || !mesasDoc[tipo]) {
      return NextResponse.json(
        { error: "No se encontraron mesas" },
        { status: 404 }
      );
    }

    const actuales = mesasDoc[tipo];
    const nuevas = actuales.slice(0, Math.max(0, actuales.length - cantidad));

    await db
      .collection("tables")
      .updateOne({ _id: mesasDoc._id }, { $set: { [tipo]: nuevas } });

    return NextResponse.json({ success: true, message: "Mesas eliminadas" });
  } catch (err) {
    console.error("Error al eliminar por cantidad:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
