"use client";
import { useState } from "react";
import { FaUtensils, FaUser, FaClock } from "react-icons/fa";
import useMesas from "../hooks/useMesas";
import MesaModal from "./MesaModal";

export default function Mesas() {
  const { mesas, loading } = useMesas();
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);

  if (loading) return <p className="text-white">Cargando mesas...</p>;

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-white text-2xl font-bold mb-6 text-center">
        Estado de Mesas
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mesas.map((mesa) => (
          <div
            key={mesa.codigo}
            onClick={() => setMesaSeleccionada(mesa)}
            className={`rounded-2xl p-4 cursor-pointer shadow-lg transition-transform hover:scale-105 duration-300 ${
              mesa.estado === "ocupado"
                ? "bg-red-600/80 text-white"
                : "bg-green-600/80 text-white"
            }`}
          >
            <h3 className="font-bold text-sm mb-2 uppercase">
              Mesa {mesa.numero}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <FaUtensils className="mb-1" />
              {mesa.productos?.[0]?.nombre || "Sin pedido"}
            </div>

            {mesa.estado === "ocupado" ? (
              <>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <FaClock /> {mesa.hora}
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <FaUser /> {mesa.cliente}
                </div>
              </>
            ) : (
              <p className="font-semibold mt-2">Disponible</p>
            )}
          </div>
        ))}

        {mesaSeleccionada && (
          <MesaModal
            mesa={mesaSeleccionada}
            onClose={() => setMesaSeleccionada(null)}
          />
        )}
      </div>
    </div>
  );
}
