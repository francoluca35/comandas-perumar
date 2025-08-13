import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Podés mejorar esto si usás sesión para saber el username automáticamente
export async function PUT(req) {
  try {
    const body = await req.json();

    const { username, email } = body;

    // Validar que al menos uno venga cargado
    if (!username && !email) {
      return NextResponse.json(
        { error: "Debes enviar al menos un campo para actualizar." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    // Definimos los campos a modificar dinámicamente
    const fieldsToUpdate = {};
    if (username) fieldsToUpdate.username = username;
    if (email) fieldsToUpdate.email = email;

    // Buscamos por username o email actual (ajustá según tu lógica)
    const criteria = username ? { username } : email ? { email } : null;

    if (!criteria) {
      return NextResponse.json(
        { error: "Falta información para encontrar el usuario." },
        { status: 400 }
      );
    }

    const result = await db
      .collection("users")
      .updateOne(criteria, { $set: fieldsToUpdate });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error en update-profile:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
