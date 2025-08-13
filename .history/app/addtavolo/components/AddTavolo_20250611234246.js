"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import BackArrow from "@/app/components/ui/BackArrow";

export default function AddTavolo() {
  const [tipo, setTipo] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [totalAdentro, setTotalAdentro] = useState(0);
  const [totalAfuera, setTotalAfuera] = useState(0);
  const [totalAdentro2, setTotalAdentro2] = useState(0);
  const [mesasAdentro, setMesasAdentro] = useState([]);
  const [mesasAfuera, setMesasAfuera] = useState([]);
  const [mesasAdentro2, setMesasAdentro2] = useState([]);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState([]);

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await fetch("/api/mesas");
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
          setMesasAdentro(data[0].mesaAdentro);
          setMesasAdentro2(data[0].mesaAdentro2);
          setMesasAfuera(data[0].mesaAfuera);
          setTotalAdentro(data[0].mesaAdentro.length);
          setTotalAdentro2(data[0].mesaAdentro2.length);
          setTotalAfuera(data[0].mesaAfuera.length);
        }
      } catch (error) {
        console.error("Error al cargar mesas:", error);
      }
    };
    fetchMesas();
  }, []);

  const handleSubmit = async () => {
    if (!tipo || tipo.trim() === "") {
      setMensaje("Debes seleccionar el tipo de mesa");
      return;
    }

    console.log("Enviando tipo:", tipo.trim(), "Cantidad:", cantidad);

    try {
      const res = await fetch("/api/mesas/agregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipo.trim(),
          cantidad: parseInt(cantidad),
        }),
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
            location.reload();
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
    <section className="w-full min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 py-16 px-4">
      <div className="max-w-2xl mx-auto backdrop-blur-lg bg-white/5 rounded-3xl p-6 md:p-10 border border-gray-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <BackArrow label="Volver al panel" />
        </div>

        <h2 className="text-3xl mt-4 md:text-4xl font-bold text-white mb-6 text-center">
          ➕ Agregar Mesas
        </h2>

        <div className="bg-white/10 p-4 rounded-xl text-white mb-6 text-sm">
          <p>
            Mesas adentro A: <strong>{totalAdentro}</strong>
          </p>
          <p>
            Mesas adentro B: <strong>{totalAdentro2}</strong>
          </p>
          <p>
            Mesas afuera: <strong>{totalAfuera}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Seleccionar tipo de mesa
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"
          >
            <option value="">-- Seleccionar --</option>
            <option value="mesaAdentro">🍽 Mesa Adentro A</option>
            <option value="mesaAdentro2">🍽 Mesa Adentro B</option>
            <option value="mesaAfuera">🌤 Mesa Afuera</option>
          </select>

          {tipo && (
            <>
              <label className="block text-sm font-medium text-white">
                Cantidad de mesas a agregar
              </label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"
                min={1}
              />
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={!tipo}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl disabled:opacity-40"
          >
            Agregar Mesas
          </button>

          {mensaje && (
            <p className="text-sm text-white text-center">{mensaje}</p>
          )}
          <button
            onClick={() => setMostrarEliminar(!mostrarEliminar)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl"
          >
            🗑 Eliminar Mesas
          </button>
        </div>
      </div>
    </section>
  );
}
