import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function PUT(req) {
  try {
    const body = await req.json();

    const {
      id,
      nombre,
      precio,
      precioConIVA,
      descuento = undefined,
      adicionales = [],
      tipo,
    } = body;

    // Validación solo de los campos requeridos estrictos
    if (!id || !nombre || !precio || !precioConIVA || !tipo) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const update = {
      nombre,
      tipo,
      precio,
      precioConIVA,
      adicionales,
    };

    // Solo agregamos el descuento si efectivamente fue enviado
    if (descuento !== undefined) {
      update.descuento = descuento;
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
