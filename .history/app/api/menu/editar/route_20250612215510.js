import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function PUT(req) {
  try {
    const { id, nombre, precio, precioConIVA, descuento, adicionales, tipo } =
      await req.json();

    if (!id || !nombre || !precio || !precioConIVA || !tipo) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const update = {
      id: producto._id,
      nombre,
      tipo,
      precio: parseInt(precio),
      precioConIVA: parseInt(precioConIVA),
      adicionales,
    };

    // Solo enviamos descuento si hay
    if (descuento !== "") {
      enviarPayload.descuento = parseInt(descuento);
    }

    await db
      .collection("menus")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    return NextResponse.json({ message: "Menú actualizado" }, { status: 200 });
  } catch (error) {
    console.error("Error al editar menú:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
