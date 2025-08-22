import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/encrypt";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    console.log("🔍 Iniciando proceso de registro...");
    
    const formData = await req.formData();

    const file = formData.get("foto");
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const nombreCompleto = formData.get("nombreCompleto");
    const rol = formData.get("rol");

    console.log("📝 Datos recibidos:", { username, email, nombreCompleto, rol, hasFile: !!file });

    if (!file || !username || !email || !password || !nombreCompleto || !rol) {
      console.log("❌ Faltan campos requeridos");
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    console.log("☁️ Subiendo imagen a Cloudinary...");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const base64String = `data:${file.type};base64,${buffer.toString(
      "base64"
    )}`;

    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder: "usuarios",
    });
    console.log("✅ Imagen subida:", uploadResult.secure_url);

    console.log("🔌 Conectando a MongoDB...");
    // 👇 Import dinámico de clientPromise
    const { default: clientPromise } = await import("@/lib/mongodb");
    const client = await clientPromise;
    const db = client.db("comandas");
    console.log("✅ Conexión a MongoDB establecida");

    console.log("🔍 Verificando si el usuario ya existe...");
    const existe = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });

    if (existe) {
      console.log("❌ Usuario o email ya existe");
      return NextResponse.json(
        { error: "Usuario o email ya existe" },
        { status: 409 }
      );
    }

    console.log("🔐 Encriptando contraseña...");
    const hashed = await hashPassword(password);

    console.log("💾 Guardando usuario en la base de datos...");
    const result = await db.collection("users").insertOne({
      username,
      email,
      password: hashed,
      nombreCompleto,
      rol,
      imagen: uploadResult.secure_url,
      createdAt: new Date(),
    });
    
    console.log("✅ Usuario guardado exitosamente:", result.insertedId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error al registrar:", err);
    return NextResponse.json({ 
      error: "Error interno", 
      details: err.message 
    }, { status: 500 });
  }
}
