"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function ModalEditarProducto({ producto, onClose, refetch }) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [precio, setPrecio] = useState(producto.precio);
  const [precioConIVA, setPrecioConIVA] = useState(producto.precioConIVA);
  const [descuento, setDescuento] = useState(producto.descuento || "");
  const [adicional, setAdicional] = useState("");
  const [adicionales, setAdicionales] = useState(producto.adicionales || []);
  const [tipo] = useState(producto.tipo);
  const [imagen, setImagen] = useState(null);

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

  const guardarCambios = async () => {
    try {
      const formData = new FormData();
      formData.append("id", producto._id);
      formData.append("nombre", nombre);
      formData.append("tipo", tipo);
      formData.append("precio", precio);
      formData.append("precioConIVA", precioConIVA);
      formData.append("descuento", descuento);
      if (imagen) formData.append("imagen", imagen);
      if (tipo === "comida") {
        formData.append("adicionales", JSON.stringify(adicionales));
      }

      const res = await fetch("/api/menu/editar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Actualizado", "Menú actualizado correctamente", "success");
        onClose();
        refetch();
      } else {
        Swal.fire("Error", data.message || "Error al actualizar", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error al actualizar el menú", "error");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/70">
      <div className="bg-white text-black rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Producto</h2>

        {producto.imagen && (
          <img
            src={imagen ? URL.createObjectURL(imagen) : producto.imagen}
            alt="Imagen"
            className="w-32 h-32 object-cover rounded mb-4"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files[0])}
          className="border rounded px-3 py-2 mb-3 w-full bg-gray-100"
        />

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border rounded px-3 py-2 mb-3 w-full bg-gray-100"
          placeholder="Nombre"
        />
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="border rounded px-3 py-2 mb-3 w-full bg-gray-100"
          placeholder="Precio"
        />
        <input
          type="number"
          value={precioConIVA}
          onChange={(e) => setPrecioConIVA(e.target.value)}
          className="border rounded px-3 py-2 mb-3 w-full bg-gray-100"
          placeholder="Precio con IVA"
        />
        <input
          type="number"
          value={descuento}
          onChange={(e) => setDescuento(e.target.value)}
          className="border rounded px-3 py-2 mb-3 w-full bg-gray-100"
          placeholder="Descuento (opcional)"
        />

        {tipo === "comida" && (
          <>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={adicional}
                onChange={(e) => setAdicional(e.target.value)}
                className="border rounded px-3 py-2 w-full bg-gray-100"
                placeholder="Agregar adicional"
              />
              <button
                onClick={agregarAdicional}
                className="bg-green-500 text-white px-3 rounded"
              >
                +
              </button>
            </div>

            {adicionales.length > 0 && (
              <ul className="mb-4 text-sm">
                {adicionales.map((a, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-gray-100 p-1 rounded mb-1"
                  >
                    {a}
                    <button
                      onClick={() => eliminarAdicional(i)}
                      className="bg-red-500 text-white rounded px-2"
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div className="flex gap-4 mt-4">
          <button
            onClick={guardarCambios}
            className="bg-green-600 text-white py-2 px-4 rounded-lg"
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-black py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
