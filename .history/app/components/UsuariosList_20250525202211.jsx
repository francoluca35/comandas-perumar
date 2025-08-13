// /app/usuarios/page.jsx o /components/UsuariosAdmin.jsx

"use client";
import { useEffect, useState } from "react";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      const res = await fetch("/api/usuarios");
      const data = await res.json();
      setUsuarios(data);
    };
    fetchUsuarios();
  }, []);

  const eliminarUsuario = async (username) => {
    if (!confirm(`¿Eliminar al usuario ${username}?`)) return;

    await fetch("/api/admin/delete-user", {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: { "Content-Type": "application/json" },
    });

    setUsuarios((prev) => prev.filter((u) => u.username !== username));
  };

  const cerrarSesion = async (username) => {
    await fetch("/api/admin/force-logout", {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: { "Content-Type": "application/json" },
    });

    setUsuarios((prev) =>
      prev.map((u) =>
        u.username === username ? { ...u, online: false, fin: new Date() } : u
      )
    );
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-white">Panel de Usuarios</h2>
      {usuarios.map((u) => (
        <div
          key={u.username}
          className="bg-slate-800 text-white p-4 rounded-lg shadow flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">
              {u.nombreCompleto} ({u.username})
            </p>
            <p className="text-sm text-gray-400">Rol: {u.rol}</p>
            <p className="text-sm">
              Estado:{" "}
              <span className={u.online ? "text-green-400" : "text-red-400"}>
                {u.online ? "Online" : "Offline"}
              </span>
            </p>
          </div>
          <div className="space-x-2">
            {u.online && (
              <button
                onClick={() => cerrarSesion(u.username)}
                className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded"
              >
                Forzar logout
              </button>
            )}
            <button
              onClick={() => eliminarUsuario(u.username)}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
