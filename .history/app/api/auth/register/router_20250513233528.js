import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/utils/encrypt";
import User from "@/app/models/User";

export async function POST(req) {
  const { username, email, password } = await req.json();

  const client = await clientPromise;
  await client.connect();
  const db = client.db("comandas");

  const existing = await db.collection("users").findOne({ username });
  if (existing)
    return NextResponse.json({ error: "Usuario ya existe" }, { status: 400 });

  const hashed = await hashPassword(password);
  const user = await db.collection("users").insertOne({
    username,
    email,
    password: hashed,
  });

  return NextResponse.json({ success: true });
}
