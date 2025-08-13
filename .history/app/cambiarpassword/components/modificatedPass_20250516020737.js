"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function ModificatedPass() {
  const [form, setForm] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      return Swal.fire("Error", data.error || "Algo falló", "error");
    }

    Swal.fire("Éxito", "Contraseña actualizada correctamente", "success");
    setForm({ username: "", oldPassword: "", newPassword: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur p-8 rounded-xl w-full max-w-md shadow-xl"
      >
        <h2 className="text-white text-2xl font-bold mb-6 text-center">
          Cambiar Contraseña 🔐
        </h2>

        <input
          type="text"
          name="username"
          placeholder="Nombre de usuario"
          value={form.username}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
          required
        />

        <input
          type="password"
          name="oldPassword"
          placeholder="Contraseña actual"
          value={form.oldPassword}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
          required
        />

        <input
          type="password"
          name="newPassword"
          placeholder="Nueva contraseña"
          value={form.newPassword}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-semibold py-2 rounded hover:bg-orange-600 transition"
        >
          {loading ? "Guardando..." : "Actualizar Contraseña"}
        </button>
      </form>
    </div>
  );
}
