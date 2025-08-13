"use client";

import { useEffect, useState } from "react";

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      const res = await fetch("/api/users/all");
      const data = await res.json();
      setUsuarios(data.users);
      setLoading(false);
    };

    fetchUsuarios();
  }, []);

  if (loading) return <p className="text-white">Cargando usuarios...</p>;

  return (
    <div className="p-6 bg-gray-900 rounded-xl text-white shadow-xl w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Usuarios</h2>
      <ul className="space-y-3">
        {usuarios.map((u) => (
          <li
            key={u.username}
            className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
          >
            <div>
              <p className="font-semibold">{u.nombreCompleto}</p>
              <p className="text-sm text-gray-400">
                {u.email} – {u.rol}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                u.online ? "bg-green-600 text-white" : "bg-gray-500 text-white"
              }`}
            >
              {u.online ? "Online" : "Offline"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
