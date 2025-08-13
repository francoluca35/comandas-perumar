import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const users = await db.collection("users").find().toArray();

    const turnos = await db
      .collection("turnos")
      .find({ online: true })
      .toArray();
    const onlineUsernames = turnos.map((t) => t.username);

    const enrichedUsers = users.map((user) => ({
      username: user.username,
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      rol: user.rol,
      online: onlineUsernames.includes(user.username),
    }));

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error("🔥 Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
