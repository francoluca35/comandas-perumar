"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

function formatHora(fecha) {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function calcularDuracion(inicio, fin) {
  if (!inicio) return "-";
  const inicioDate = new Date(inicio);
  const finDate = fin ? new Date(fin) : new Date();

  const diffMs = finDate - inicioDate;
  const seg = Math.floor(diffMs / 1000);
  const h = String(Math.floor(seg / 3600)).padStart(2, "0");
  const m = String(Math.floor((seg % 3600) / 60)).padStart(2, "0");
  const s = String(seg % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
}

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user?.rol === "admin";

  useEffect(() => {
    const fetchUsuarios = async () => {
      const res = await fetch("/api/users/all");
      const data = await res.json();
      setUsuarios(data.users);
      setLoading(false);
    };

    fetchUsuarios();
    const interval = setInterval(fetchUsuarios, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/turnos/ultima-exportacion")
      .then((res) => res.json())
      .then(({ fecha }) => {
        if (!fecha) return;
        const ultima = new Date(fecha);
        const ahora = new Date();
        const dias = Math.floor((ahora - ultima) / (1000 * 60 * 60 * 24));

        if (dias < 15) {
          Swal.fire({
            title: `Han pasado ${dias} días desde la última exportación.`,
            text: "¿Querés descargar el Excel de turnos y limpiar la base de datos?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, descargar",
            cancelButtonText: "No, esperar",
          }).then((res) => {
            if (res.isConfirmed) descargarExcelTurnos();
          });
        }
      });
  }, [isAdmin]);

  const descargarExcelTurnos = async () => {
    try {
      const res = await fetch("/api/turnos/exportar");
      if (!res.ok) throw new Error("Error al generar el Excel");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "turnos.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);

      alert("✅ Excel descargado y turnos eliminados correctamente.");
    } catch (err) {
      alert("❌ Error al exportar: " + err.message);
    }
  };

  useEffect(() => {
    if (user?.rol === "admin") {
      fetch("/api/turnos/checkexport")
        .then((res) => res.json())
        .then(async (data) => {
          if (!data?.diasPasados && data?.diasPasados !== 0) return;

          const { diasPasados } = data;

          if (diasPasados < 15) {
            const confirmacion = confirm(
              `Han pasado ${diasPasados} días desde la última exportación.\n¿Querés descargar el Excel y limpiar los turnos ahora?`
            );

            if (confirmacion) {
              await descargarExcelTurnos();
            }
          }
        });
    }
  }, [user]);

  if (loading) return <p className="text-white">Cargando usuarios...</p>;

  return (
    <div className="">
      <div className="p-6 bg-gray-900 rounded-xl text-white shadow-xl w-full max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Usuarios</h2>
        <table className="w-full text-sm text-left text-white">
          <thead>
            <tr className="text-orange-400 border-b border-gray-700">
              <th className="py-2">Nombre</th>
              <th className="py-2">Email</th>
              <th className="py-2">Rol</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Inicio</th>
              <th className="py-2">Cierre</th>
              <th className="py-2">Tiempo</th>
              {isAdmin && <th className="py-2 text-center">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.username} className="border-b border-gray-800">
                <td className="py-2">{u.nombreCompleto}</td>
                <td className="py-2 text-gray-300">{u.email}</td>
                <td className="py-2 text-gray-400">{u.rol}</td>
                <td className="py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      u.online
                        ? "bg-green-600 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {u.online ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="py-2">{formatHora(u.inicio)}</td>
                <td className="py-2">{formatHora(u.fin)}</td>
                <td className="py-2">{calcularDuracion(u.inicio, u.fin)}</td>
                {isAdmin && (
                  <td className="py-2 space-x-2 text-center">
                    {u.online && (
                      <button
                        onClick={() => handleForceLogout(u.username)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-xs px-2 py-1 rounded"
                      >
                        Cerrar sesión
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.username)}
                      className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1 rounded"
                    >
                      Eliminar Cuenta
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {isAdmin && (
          <div className="mt-6 text-center">
            <button
              onClick={descargarExcelTurnos}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Descargar Excel y limpiar turnos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
