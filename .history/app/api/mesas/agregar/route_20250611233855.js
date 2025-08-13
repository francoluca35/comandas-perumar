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

    const mesasActuales = mesasDoc[tipoSanitizado] || [];

    const baseNumero =
      mesasActuales.length > 0
        ? Math.max(...mesasActuales.map((m) => m.numero))
        : tipoSanitizado === "mesaAdentro"
        ? 0
        : tipoSanitizado === "mesaAdentro2"
        ? 15
        : 30; // <-- ahora afuera empieza desde el 31

    const nuevasMesas = [];

    for (let i = 1; i <= cantidad; i++) {
      const nuevoNumero = baseNumero + i;

      nuevasMesas.push({
        codigo: generarCodigoMesa(tipoSanitizado, nuevoNumero),
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

    await db
      .collection("tables")
      .updateOne(
        { _id: mesasDoc._id },
        { $set: { [tipoSanitizado]: [...mesasActuales, ...nuevasMesas] } }
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
  if (tipo === "mesaAdentro2") return `MESA_B${numero}`; // Las de lado B las diferenciamos con prefijo B
  if (tipo === "mesaAfuera") return `MESA_AF${numero}`; // (Si querés que afuera tenga código diferente, aquí lo puedes cambiar)
  return `MESA_${numero}`;
}
