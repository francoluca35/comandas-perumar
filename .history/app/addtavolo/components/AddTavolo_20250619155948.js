"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import BackArrow from "@/app/components/ui/BackArrow";

export default function AddTavolo() {
  const [tipoAgregar, setTipoAgregar] = useState("");
  const [cantidadAgregar, setCantidadAgregar] = useState(1);

  const [tipoEliminar, setTipoEliminar] = useState("");
  const [cantidadEliminar, setCantidadEliminar] = useState(1);

  const [mensaje, setMensaje] = useState("");
  const [mesasAdentro, setMesasAdentro] = useState([]);
  const [mesasAdentro2, setMesasAdentro2] = useState([]);
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
          setMesasAdentro2(data[0].mesaAdentro2);
          setMesasAfuera(data[0].mesaAfuera);
        }
      } catch (error) {
        console.error("Error al cargar mesas:", error);
      }
    };
    fetchMesas();
  }, []);

  const handleAgregar = async () => {
    if (!tipoAgregar || tipoAgregar.trim() === "") {
      setMensaje("Seleccioná un tipo de mesa");
      return;
    }

    try {
      const res = await fetch("/api/mesas/agregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipoAgregar.trim(),
          cantidad: parseInt(cantidadAgregar),
        }),
      });

      if (res.ok) {
        Swal.fire("Agregado", "Mesas agregadas correctamente", "success");
        setTipoAgregar("");
        setCantidadAgregar(1);
        location.reload();
      } else {
        setMensaje("Error al agregar mesas");
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error de conexión");
    }
  };

  const eliminarMesasSeleccionadas = async () => {
    if (seleccionadas.length === 0) return;

    const confirm = await Swal.fire({
      title: "¿Eliminar mesas seleccionadas?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch("/api/mesas/eliminar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigos: seleccionadas }),
      });

      if (res.ok) {
        Swal.fire("Eliminadas", "Mesas eliminadas correctamente", "success");
        setSeleccionadas([]);
        location.reload();
      } else {
        Swal.fire("Error", "No se pudieron eliminar", "error");
      }
    } catch {
      Swal.fire("Error", "Error de red", "error");
    }
  };

  const eliminarPorCantidad = async () => {
    if (!tipoEliminar || cantidadEliminar <= 0) {
      return Swal.fire("Faltan datos", "Seleccioná tipo y cantidad", "warning");
    }

    const confirm = await Swal.fire({
      title: `¿Eliminar ${cantidadEliminar} mesas?`,
      text: `Tipo: ${tipoEliminar}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch("/api/mesas/eliminar-cantidad", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipoEliminar.trim(),
          cantidad: parseInt(cantidadEliminar),
        }),
      });

      if (res.ok) {
        Swal.fire("Eliminadas", "Mesas eliminadas correctamente", "success");
        location.reload();
      } else {
        Swal.fire("Error", "No se pudieron eliminar", "error");
      }
    } catch {
      Swal.fire("Error", "Error de red", "error");
    }
  };

  const toggleSeleccion = (codigo) => {
    setSeleccionadas((prev) =>
      prev.includes(codigo)
        ? prev.filter((c) => c !== codigo)
        : [...prev, codigo]
    );
  };

  return (
    <section className="p-4">
      <h2 className="text-xl font-bold text-white mb-4">➕ Agregar Mesas</h2>

      {/* AGREGAR */}
      <div className="mb-6 space-y-2">
        <select
          value={tipoAgregar}
          onChange={(e) => setTipoAgregar(e.target.value)}
          className="w-full p-2 rounded-xl"
        >
          <option value="">-- Tipo de mesa --</option>
          <option value="mesaAdentro">Mesa Adentro A</option>
          <option value="mesaAdentro2">Mesa Adentro B</option>
          <option value="mesaAfuera">Mesa Afuera</option>
        </select>
        <input
          type="number"
          value={cantidadAgregar}
          onChange={(e) => setCantidadAgregar(e.target.value)}
          min={1}
          className="w-full p-2 rounded-xl"
          placeholder="Cantidad"
        />
        <button
          onClick={handleAgregar}
          className="w-full bg-green-600 text-white py-2 rounded-xl"
        >
          Agregar Mesas
        </button>
      </div>

      <hr className="my-4 border-white/20" />

      <button
        onClick={() => setMostrarEliminar(!mostrarEliminar)}
        className="w-full bg-red-600 py-2 rounded-xl text-white"
      >
        🗑 Eliminar Mesas
      </button>

      {mostrarEliminar && (
        <>
          {/* ELIMINAR POR BOTONERA */}
          <div className="my-4 grid grid-cols-4 gap-2">
            {[...mesasAdentro, ...mesasAdentro2, ...mesasAfuera].map((mesa) => (
              <button
                key={mesa.codigo}
                onClick={() => toggleSeleccion(mesa.codigo)}
                className={`rounded-xl p-2 text-sm ${
                  seleccionadas.includes(mesa.codigo)
                    ? "bg-red-500 text-white"
                    : "bg-white/10 text-white"
                }`}
              >
                {mesa.numero}
              </button>
            ))}
          </div>

          {seleccionadas.length > 0 && (
            <button
              onClick={eliminarMesasSeleccionadas}
              className="w-full bg-red-700 text-white py-2 rounded-xl"
            >
              Confirmar eliminación seleccionadas
            </button>
          )}

          {/* ELIMINAR POR CANTIDAD */}
          <div className="my-6 space-y-2">
            <select
              value={tipoEliminar}
              onChange={(e) => setTipoEliminar(e.target.value)}
              className="w-full p-2 rounded-xl"
            >
              <option value="">-- Tipo a eliminar --</option>
              <option value="mesaAdentro">Mesa Adentro A</option>
              <option value="mesaAdentro2">Mesa Adentro B</option>
              <option value="mesaAfuera">Mesa Afuera</option>
            </select>
            <input
              type="number"
              value={cantidadEliminar}
              onChange={(e) => setCantidadEliminar(e.target.value)}
              min={1}
              className="w-full p-2 rounded-xl"
              placeholder="Cantidad a eliminar"
            />
            <button
              onClick={eliminarPorCantidad}
              className="w-full bg-red-800 text-white py-2 rounded-xl"
            >
              Eliminar por cantidad
            </button>
          </div>
        </>
      )}
    </section>
  );
}
