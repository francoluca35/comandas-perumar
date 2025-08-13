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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {mesas.map((mesa) => (
        <div
          key={mesa.codigo}
          onClick={() => mesa.estado === "libre" && setMesaSeleccionada(mesa)}
          className={`rounded-lg p-4 cursor-pointer shadow-md ${
            mesa.estado === "ocupada"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          <h3 className="font-bold text-sm mb-2">TABLE {mesa.numero}</h3>
          <FaUtensils className="mb-1" />
          {mesa.estado === "ocupado" ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <FaClock /> {mesa.hora}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaUser /> {mesa.usuario}
              </div>
            </>
          ) : (
            <p className="font-semibold">Disponible</p>
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
  );
}
