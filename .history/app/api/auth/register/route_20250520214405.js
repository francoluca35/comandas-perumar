import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/utils/encrypt";
import cloudinary from "@/lib/cloudinary";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const form = new IncomingForm();
  const data = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  const { username, email, password, nombreCompleto, rol } = data.fields;
  const file = data.files.foto[0];

  const client = await clientPromise;
  const db = client.db("comandas");

  const existingUser = await db.collection("users").findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Usuario o email ya existe" },
      { status: 409 }
    );
  }

  // Subir imagen a Cloudinary
  const result = await cloudinary.uploader.upload(file.filepath, {
    folder: "usuarios",
    public_id: `perfil-${randomUUID()}`,
  });

  const hashedPassword = await hashPassword(password);

  const newUser = {
    username,
    email,
    nombreCompleto,
    rol,
    password: hashedPassword,
    createdAt: new Date(),
    imagen: result.secure_url,
  };

  await db.collection("users").insertOne(newUser);

  return NextResponse.json({ success: true });
}
