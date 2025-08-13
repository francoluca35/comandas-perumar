"use client";
import { useState } from "react";
import Swal from "sweetalert2";

export default function ModalEditarProducto({ producto, onClose, refetch }) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [precio, setPrecio] = useState(producto.precio);
  const [descuento, setDescuento] = useState(producto.descuento || "");
  const [adicional, setAdicional] = useState("");
  const [adicionales, setAdicionales] = useState(producto.adicionales || []);
  const [categoria, setCategoria] = useState(producto.categoria || "brasas");
  const [alcohol, setAlcohol] = useState(producto.alcohol || false);

  const handleGuardar = async () => {
    const confirm = await Swal.fire({
      title: "¿Guardar cambios?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch("/api/menu/editar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: producto._id,
          nombre,
          precio,
          descuento,
          adicionales,
          ...(producto.tipo === "bebida" && { alcohol }),
          ...(producto.tipo === "comida" && { categoria }),
        }),
      });

      if (!res.ok) throw new Error("Error al editar");

      Swal.fire("Guardado", "Producto actualizado correctamente", "success");
      refetch?.();
      onClose();
    } catch (err) {
      Swal.fire("Error", "No se pudo guardar el producto", "error");
    }
  };

  const agregarAdicional = () => {
    if (adicional.trim()) {
      setAdicionales([...adicionales, adicional.trim()]);
      setAdicional("");
    }
  };

  const eliminarAdicional = (index) => {
    const nuevos = adicionales.filter((_, i) => i !== index);
    setAdicionales(nuevos);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-white/10 border border-white/20 p-6 rounded-xl w-full max-w-lg text-white relative">
        <h3 className="text-2xl font-bold mb-4">Editar producto</h3>

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded bg-white/10 border border-gray-500"
          placeholder="Nombre"
        />

        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded bg-white/10 border border-gray-500"
          placeholder="Precio"
        />

        <input
          type="number"
          value={descuento}
          onChange={(e) => setDescuento(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded bg-white/10 border border-gray-500"
          placeholder="Descuento"
        />

        {producto.tipo === "comida" && (
          <>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full mb-3 px-4 py-2 rounded bg-white/10 border border-gray-500"
            >
              <option value="brasas">🔥 Brasas</option>
              <option value="salteados y criollos">
                🍲 Salteados y Criollos
              </option>
              <option value="pescados y mariscos">
                🐟 Pescados y Mariscos
              </option>
            </select>

            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={adicional}
                onChange={(e) => setAdicional(e.target.value)}
                className="w-full px-4 py-2 rounded bg-white/10 border border-gray-500"
                placeholder="Adicional"
              />
              <button
                onClick={agregarAdicional}
                className="bg-green-600 px-4 py-2 rounded"
              >
                Agregar
              </button>
            </div>

            <ul className="list-disc pl-5 text-sm text-cyan-300 mb-4">
              {adicionales.map((a, i) => (
                <li key={i} className="flex justify-between items-center">
                  {a}
                  <button
                    onClick={() => eliminarAdicional(i)}
                    className="ml-2 bg-red-500 px-2 text-white rounded-full"
                  >
                    <FiX />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {producto.tipo === "bebida" && (
          <div className="mb-4 flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!alcohol}
                onChange={() => setAlcohol(false)}
              />
              Sin alcohol
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={alcohol}
                onChange={() => setAlcohol(true)}
              />
              Con alcohol
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
