import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/utils/encrypt";

export async function POST(req) {
  try {
    const { username, email, password, rol } = await req.json();

    if (!username || !email || !password || !rol) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario o email ya existe" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const result = await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, userId: result.insertedId });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
