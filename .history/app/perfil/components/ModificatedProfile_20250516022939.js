"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function ModificatedProfile() {
  const [currentUser, setCurrentUser] = useState("");
  const [form, setForm] = useState({
    newUsername: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("usuario");
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

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

    login(data.user);
    localStorage.setItem("usuario", data.user.username); // <-- GUARDAMOS EL USUARIO

    setTimeout(() => {
      router.push("/screenhome");
    }, 100);
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

        <label className="text-white text-sm mb-1 block">Usuario actual</label>
        <input
          type="text"
          value={currentUser}
          disabled
          className="w-full px-4 py-2 rounded bg-gray-800 text-gray-400 mb-4 border border-gray-600"
        />

        <label className="text-white text-sm mb-1 block">Nuevo usuario</label>
        <input
          type="text"
          name="newUsername"
          placeholder="Nuevo usuario"
          value={form.newUsername}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
        />

        <label className="text-white text-sm mb-1 block">Nuevo correo</label>
        <input
          type="email"
          name="email"
          placeholder="Nuevo correo electrónico"
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
