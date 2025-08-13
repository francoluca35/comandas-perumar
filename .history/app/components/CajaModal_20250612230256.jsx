"use client";

import { useState } from "react";
import useCajaRegistradora from "@/app/hooks/useCajaRegistradora";
import Swal from "sweetalert2";

export default function CajaModal({ onClose }) {
  const { monto, actualizarCaja } = useCajaRegistradora();
  const [nuevoMonto, setNuevoMonto] = useState("");

  const handleActualizar = async () => {
    if (!nuevoMonto) return;
    await actualizarCaja(nuevoMonto);
    Swal.fire("Caja actualizada", "El monto fue actualizado", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md text-black">
        <h2 className="text-2xl font-bold mb-4 text-center">
          💰 Caja Registradora
        </h2>
        <p className="text-center mb-6 text-lg">
          Monto actual: <b>${monto}</b>
        </p>

        <input
          type="number"
          placeholder="Nuevo monto"
          value={nuevoMonto}
          onChange={(e) => setNuevoMonto(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />

        <div className="flex justify-between">
          <button
            onClick={handleActualizar}
            className="bg-green-600 text-white py-2 px-4 rounded-lg"
          >
            Actualizar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
