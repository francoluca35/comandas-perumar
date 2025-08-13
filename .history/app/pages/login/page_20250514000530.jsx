"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function login() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al iniciar sesión");
      return;
    }

    // Podés guardar user en contexto o localStorage si querés
    router.push("/screenhome");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded-md space-y-4 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center">Iniciar sesión</h2>

        <input
          type="text"
          name="username"
          placeholder="Usuario"
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-orange-500 text-white w-full py-2 rounded hover:bg-orange-600"
        >
          Iniciar sesión
        </button>

        <p className="text-center text-sm">
          ¿No tenés cuenta?{" "}
          <a href="/register" className="text-orange-500 font-bold">
            Registrarse
          </a>
        </p>
      </form>
    </div>
  );
}
