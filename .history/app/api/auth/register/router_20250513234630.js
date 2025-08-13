import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/utils/encrypt";
import { MongoClient } from "mongodb";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();
    const hashedPassword = await hashPassword(password);

    const client = await clientPromise;
    const db = client.db("comandas");

    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: "Usuario ya existe" }, { status: 400 });
    }

    const newUser = await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ success: true, userId: newUser.insertedId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 });
  }
}
