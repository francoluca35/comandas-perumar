"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function AddTavolo() {
  const [tipo, setTipo] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [totalAdentro, setTotalAdentro] = useState(0);
  const [totalAfuera, setTotalAfuera] = useState(0);

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await fetch("/api/mesas");
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
          setTotalAdentro(data[0].mesaAdentro.length);
          setTotalAfuera(data[0].mesaAfuera.length);
        }
      } catch (error) {
        console.error("Error al cargar mesas:", error);
      }
    };
    fetchMesas();
  }, []);

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
        Swal.fire({
          title: "Mesas agregadas exitosamente",
          text: "¿Deseás agregar más mesas?",
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Sí, agregar más",
          cancelButtonText: "No, cerrar",
        }).then((result) => {
          if (!result.isConfirmed) {
            setTipo("");
            setCantidad(1);
            setMensaje("");
          }
        });
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

      <div className="bg-gray-100 p-3 rounded-md text-sm">
        <p>
          Mesas adentro: <strong>{totalAdentro}</strong>
        </p>
        <p>
          Mesas afuera: <strong>{totalAfuera}</strong>
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Seleccionar tipo de mesa
        </label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">-- Seleccionar --</option>
          <option value="mesaAdentro">Mesa Adentro</option>
          <option value="mesaAfuera">Mesa Afuera</option>
        </select>

        {tipo && (
          <>
            <label className="block text-sm font-medium">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              min={1}
            />
          </>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!tipo}
        className="bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        Agregar
      </button>

      {mensaje && <p className="text-sm text-gray-700">{mensaje}</p>}
    </div>
  );
}
