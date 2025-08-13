"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function ModificatedProfile() {
  const [currentUser, setCurrentUser] = useState("franco123"); // o traelo del contexto si usás login
  const [form, setForm] = useState({
    newUsername: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const body = {
      currentUsername: currentUser, // requerido para buscar
      ...(form.newUsername.trim() && { newUsername: form.newUsername.trim() }),
      ...(form.email.trim() && { email: form.email.trim() }),
    };

    if (!body.newUsername && !body.email) {
      setLoading(false);
      return Swal.fire("Aviso", "Debés completar al menos un campo", "info");
    }

    const res = await fetch("/api/auth/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      return Swal.fire("Error", data.error || "Algo falló", "error");
    }

    Swal.fire("Éxito", "Perfil actualizado correctamente", "success");
    setForm({ newUsername: "", email: "" });
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
          value={currentUser}
          disabled
          className="w-full px-4 py-2 rounded bg-gray-800 text-gray-400 mb-4 border border-gray-600"
        />

        <input
          type="text"
          name="newUsername"
          placeholder="Nuevo usuario (opcional)"
          value={form.newUsername}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
        />

        <input
          type="email"
          name="email"
          placeholder="Nuevo correo (opcional)"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
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
