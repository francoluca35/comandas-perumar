"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function ModificatedProfile() {
  const [form, setForm] = useState({
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      return Swal.fire("Error", data.error || "Algo falló", "error");
    }

    Swal.fire("Éxito", "Perfil actualizado correctamente", "success");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur p-8 rounded-xl w-full max-w-md shadow-xl"
      >
        <h2 className="text-white text-2xl font-bold mb-6 text-center">
          Editar Perfil 📝
        </h2>

        <input
          type="text"
          name="username"
          placeholder="Nuevo usuario"
          value={form.username}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Nuevo correo"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-semibold py-2 rounded hover:bg-orange-600 transition"
        >
          {loading ? "Guardando..." : "Actualizar Perfil"}
        </button>
      </form>
    </div>
  );
}
