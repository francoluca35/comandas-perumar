import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { tipo, cantidad } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    const mesasDoc = await db.collection("tables").findOne({});
    if (!mesasDoc) {
      return NextResponse.json(
        { error: "No se encontró documento de mesas" },
        { status: 404 }
      );
    }

    const mesaAdentro = mesasDoc.mesaAdentro || [];
    const mesaAfuera = mesasDoc.mesaAfuera || [];

    let nuevasMesas = [];
    let nuevoDoc = { ...mesasDoc };

    if (tipo === "mesaAdentro") {
      const nuevoNumero = mesaAdentro.length
        ? Math.max(...mesaAdentro.map((m) => m.numero)) + 1
        : 1;

      nuevasMesas = Array.from({ length: cantidad }, (_, i) => ({
        numero: nuevoNumero + i,
        codigo: `MA${nuevoNumero + i}`,
        cliente: "",
        productos: [],
        metodoPago: "",
        total: 0,
        estado: "libre",
        hora: "",
        fecha: "",
      }));

      nuevoDoc.mesaAdentro = [...mesaAdentro, ...nuevasMesas];

      // renumerar mesaAfuera para continuar
      let inicio = nuevoNumero + cantidad;
      nuevoDoc.mesaAfuera = mesaAfuera.map((m, i) => ({
        ...m,
        numero: inicio + i,
        codigo: `ME${inicio + i}`,
      }));
    } else if (tipo === "mesaAfuera") {
      const nuevoNumero = mesaAfuera.length
        ? Math.max(...mesaAfuera.map((m) => m.numero)) + 1
        : mesaAdentro.length
        ? Math.max(...mesaAdentro.map((m) => m.numero)) + 1
        : 1;

      nuevasMesas = Array.from({ length: cantidad }, (_, i) => ({
        numero: nuevoNumero + i,
        codigo: `ME${nuevoNumero + i}`,
        cliente: "",
        productos: [],
        metodoPago: "",
        total: 0,
        estado: "libre",
        hora: "",
        fecha: "",
      }));

      nuevoDoc.mesaAfuera = [...mesaAfuera, ...nuevasMesas];
    } else {
      return NextResponse.json(
        { error: "Tipo de mesa inválido" },
        { status: 400 }
      );
    }

    await db.collection("tables").updateOne(
      { _id: mesasDoc._id },
      {
        $set: {
          mesaAdentro: nuevoDoc.mesaAdentro,
          mesaAfuera: nuevoDoc.mesaAfuera,
        },
      }
    );

    return NextResponse.json({ success: true, nuevasMesas });
  } catch (error) {
    console.error("Error al agregar mesas:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
