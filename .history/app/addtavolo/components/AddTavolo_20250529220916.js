"use client";

import { useState } from "react";

export default function AddTavolo() {
  const [tipo, setTipo] = useState("mesaAdentro");
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/mesas/agregar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipo, cantidad: parseInt(cantidad) }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje("Mesas agregadas exitosamente");
      } else {
        setMensaje(data.error || "Error al agregar mesas");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error en la solicitud");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-lg font-bold">Agregar Mesa</h2>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Tipo de mesa</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="mesaAdentro">Mesa Adentro</option>
          <option value="mesaAfuera">Mesa Afuera</option>
        </select>
        <label className="block text-sm font-medium">Cantidad</label>
        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          min={1}
        />
      </div>
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded-md"
      >
        Agregar
      </button>
      {mensaje && <p className="text-sm text-gray-700">{mensaje}</p>}
    </div>
  );
}
