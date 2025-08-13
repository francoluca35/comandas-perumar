import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username } = await req.json();

    // Dynamic import para evitar problemas de build
    const { default: clientPromise } = await import("@/lib/mongodb");
    const client = await clientPromise;
    const db = client.db("comandas");

    // Buscar el turno activo más reciente
    const turnoActivo = await db
      .collection("turnos")
      .findOne({ username, online: true }, { sort: { inicio: -1 } });

    if (!turnoActivo) {
      return NextResponse.json({
        message: "No hay sesión activa para cerrar.",
      });
    }

    // Actualizar el turno encontrado
    await db.collection("turnos").updateOne(
      { _id: turnoActivo._id },
      {
        $set: {
          fin: new Date(),
          online: false,
        },
      }
    );

    return NextResponse.json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("🔥 Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
