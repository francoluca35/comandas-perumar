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
  const [mesasAdentro, setMesasAdentro] = useState([]);
  const [mesasAfuera, setMesasAfuera] = useState([]);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState([]);

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await fetch("/api/mesas");
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
          setMesasAdentro(data[0].mesaAdentro);
          setMesasAfuera(data[0].mesaAfuera);
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
        headers: { "Content-Type": "application/json" },
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

  const toggleSeleccion = (codigo) => {
    setSeleccionadas((prev) =>
      prev.includes(codigo)
        ? prev.filter((c) => c !== codigo)
        : [...prev, codigo]
    );
  };

  const eliminarMesas = async () => {
    if (seleccionadas.length === 0) return;
    const confirm = await Swal.fire({
      title: "¿Eliminar mesas seleccionadas?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await fetch("/api/mesas/eliminar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigos: seleccionadas }),
      });
      Swal.fire("Eliminado", "Las mesas fueron eliminadas", "success");
      setSeleccionadas([]);
      setMostrarEliminar(false);
      location.reload();
    } catch (err) {
      Swal.fire("Error", "No se pudieron eliminar mesas", "error");
    }
  };

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 px-4">
      <div className="max-w-2xl mx-auto backdrop-blur-lg bg-white/5 rounded-3xl p-6 md:p-10 border border-gray-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <BackArrow label="Volver al panel" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
          ➕ Agregar Mesas
        </h2>

        <div className="bg-white/10 p-4 rounded-xl text-white mb-6 text-sm">
          <p>
            Mesas adentro: <strong>{totalAdentro}</strong>
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
            <option value="" className="text-black">
              -- Seleccionar --
            </option>
            <option value="mesaAdentro" className="text-black">
              🍽 Mesa Adentro
            </option>
            <option value="mesaAfuera" className="text-black">
              🌤 Mesa Afuera
            </option>
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

          <button
            onClick={() => setMostrarEliminar(!mostrarEliminar)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl"
          >
            🗑 Eliminar Mesas
          </button>

          {mostrarEliminar && (
            <div className="grid grid-cols-4 gap-3 mt-6">
              {[...mesasAdentro, ...mesasAfuera].map((mesa) => (
                <button
                  key={mesa.codigo}
                  onClick={() => toggleSeleccion(mesa.codigo)}
                  className={`px-3 py-2 rounded-xl font-bold border text-sm transition-all duration-200
                    ${
                      seleccionadas.includes(mesa.codigo)
                        ? "bg-red-500 text-white border-red-600"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    }`}
                >
                  {mesa.numero}
                </button>
              ))}
              {seleccionadas.length > 0 && (
                <div className="col-span-4 mt-4">
                  <button
                    onClick={eliminarMesas}
                    className="w-full bg-red-700 hover:bg-red-800 text-white py-2 rounded-xl"
                  >
                    Confirmar eliminación
                  </button>
                </div>
              )}
            </div>
          )}

          {mensaje && (
            <p className="text-sm text-white text-center">{mensaje}</p>
          )}
        </div>
      </div>
    </section>
  );
}
