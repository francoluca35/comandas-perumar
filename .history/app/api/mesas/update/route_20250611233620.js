import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { tipo, cantidad } = await req.json();

    // Validamos que el tipo sea correcto
    if (!["mesaAdentro", "mesaAdentro2", "mesaAfuera"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");
    const mesasDoc = await db.collection("tables").findOne({});

    const mesasActuales = mesasDoc[tipo] || [];

    // Calculamos el próximo número de mesa según el bloque
    const baseNumero =
      mesasActuales.length > 0
        ? Math.max(...mesasActuales.map((m) => m.numero))
        : tipo === "mesaAdentro"
        ? 0
        : tipo === "mesaAdentro2"
        ? 15
        : 30; // bloques de numeración (podés ajustar si querés otros rangos)

    const nuevasMesas = [];

    for (let i = 1; i <= cantidad; i++) {
      const nuevoNumero = baseNumero + i;

      nuevasMesas.push({
        codigo: generarCodigoMesa(tipo, nuevoNumero),
        numero: nuevoNumero,
        estado: "libre",
        cliente: null,
        productos: [],
        metodoPago: "",
        total: 0,
        hora: "",
        fecha: "",
      });
    }

    // Actualizamos el documento principal de mesas
    await db
      .collection("tables")
      .updateOne(
        { _id: mesasDoc._id },
        { $set: { [tipo]: [...mesasActuales, ...nuevasMesas] } }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error agregando mesas:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// Función generadora de códigos por tipo
function generarCodigoMesa(tipo, numero) {
  if (tipo === "mesaAdentro")
    return `MESA_${numero.toString().padStart(3, "0")}`;
  if (tipo === "mesaAdentro2") return `MESA_B${numero}`;
  if (tipo === "mesaAfuera") return `MESA_${numero}`;
  return `MESA_${numero}`;
}
