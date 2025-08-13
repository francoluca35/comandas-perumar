import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { tipo, cantidad } = await req.json();
    const tipoSanitizado = tipo.trim();

    const tiposValidos = ["mesaAdentro", "mesaAdentro2", "mesaAfuera"];
    if (!tiposValidos.includes(tipoSanitizado)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const mesasDoc = await db.collection("tables").findOne({});
    const mesaAdentro = mesasDoc.mesaAdentro || [];
    const mesaAdentro2 = mesasDoc.mesaAdentro2 || [];
    const mesaAfuera = mesasDoc.mesaAfuera || [];

    // Contar total de mesas existentes
    const totalExistente =
      mesaAdentro.length + mesaAdentro2.length + mesaAfuera.length;

    const nuevasMesas = [];

    for (let i = 1; i <= cantidad; i++) {
      const numeroGlobal = totalExistente + i;
      nuevasMesas.push({
        codigo: generarCodigoMesa(tipoSanitizado, numeroGlobal),
        numero: numeroGlobal,
        estado: "libre",
        cliente: null,
        productos: [],
        metodoPago: "",
        total: 0,
        hora: "",
        fecha: "",
      });
    }

    // Agregar las nuevas mesas al tipo correspondiente
    const nuevasDelTipo = [...(mesasDoc[tipoSanitizado] || []), ...nuevasMesas];

    await db
      .collection("tables")
      .updateOne(
        { _id: mesasDoc._id },
        { $set: { [tipoSanitizado]: nuevasDelTipo } }
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

function generarCodigoMesa(tipo, numero) {
  if (tipo === "mesaAdentro")
    return `MESA_${numero.toString().padStart(3, "0")}`;
  if (tipo === "mesaAdentro2") return `MESA_B${numero}`;
  if (tipo === "mesaAfuera") return `MESA_AF${numero}`;
  return `MESA_${numero}`;
}
