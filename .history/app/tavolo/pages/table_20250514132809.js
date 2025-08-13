"use client";

import { useEffect, useState } from "react";
import { FaUtensils, FaUser, FaClock } from "react-icons/fa";

export default function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [pisoActivo, setPisoActivo] = useState("Piso 01");

  useEffect(() => {
    // Simulación de fetch desde la BD
    const fetchMesas = async () => {
      const data = [
        {
          numero: "01",
          estado: "ocupada",
          hora: "11:23 AM",
          usuario: "JSMITH",
        },
        {
          numero: "03",
          estado: "ocupada",
          hora: "23:09:48",
          usuario: "USER01",
        },
        { numero: "04", estado: "libre" },
        { numero: "05", estado: "libre" },
      ];
      setMesas(data);
    };
    fetchMesas();
  }, []);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-orange-600">🍽️ Comandas</h2>
        <button className="text-orange-600 border border-orange-600 p-2 rounded-full hover:bg-orange-100">
          ⟳
        </button>
      </div>

      {/* Selector de piso */}
      <div className="flex gap-2 mb-4">
        {["Piso 01", "Piso 02"].map((piso) => (
          <button
            key={piso}
            onClick={() => setPisoActivo(piso)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${
              piso === pisoActivo
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <FaUtensils /> {piso}
          </button>
        ))}
      </div>

      {/* Lista de mesas */}
      <div className="grid grid-cols-2 gap-4">
        {mesas.map((mesa) => (
          <div
            key={mesa.numero}
            className={`rounded-lg p-4 shadow-md ${
              mesa.estado === "ocupada"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            <h3 className="font-bold text-sm mb-2">TABLE {mesa.numero}</h3>
            <FaUtensils className="mb-1" />
            {mesa.estado === "ocupada" ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <FaClock /> {mesa.hora}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaUser /> {mesa.usuario}
                </div>
              </>
            ) : (
              <p className="font-semibold">Available</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
