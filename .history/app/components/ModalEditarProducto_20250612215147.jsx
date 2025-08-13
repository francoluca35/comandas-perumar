import { useState } from "react";
import Swal from "sweetalert2";

export default function ModalEditarProducto({ producto, onClose, refetch }) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [precio, setPrecio] = useState(producto.precio);
  const [precioConIVA, setPrecioConIVA] = useState(producto.precioConIVA);
  const [descuento, setDescuento] = useState(producto.descuento || 0);
  const [adicionales, setAdicionales] = useState(producto.adicionales || []);
  const [tipo, setTipo] = useState(producto.tipo);

  const guardarCambios = async () => {
    try {
      const res = await fetch("/api/menu/editar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: producto._id,
          nombre,
          precio: parseInt(precio),
          precioConIVA: parseInt(precioConIVA),
          descuento: parseInt(descuento),
          adicionales,
          tipo,
        }),
      });

      if (res.ok) {
        Swal.fire("Actualizado", "Menú actualizado correctamente", "success");
        onClose();
        refetch(); // refresca la lista
      } else {
        Swal.fire("Error", "No se pudo actualizar el menú", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Error al actualizar el menú", "error");
    }
  };

  return (
    <div className="fixed inset-0  flex justify-center items-center z-50">
      <div className="bg-white text-black rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Producto</h2>

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
