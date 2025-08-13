import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_demo";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "El correo es requerido" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("comandas");
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "No se encontró un usuario con ese correo" },
        { status: 404 }
      );
    }

    // 🔐 Generar token válido por 15 minutos
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // ✉️ Configurar Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Soporte Chekka" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Recuperar contraseña",
      html: `
        <p>Hola <b>${user.username}</b>,</p>
        <p>Haz clic en el siguiente enlace para cambiar tu contraseña. El enlace vence en 15 minutos:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Se envió un correo con el enlace de recuperación",
    });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
