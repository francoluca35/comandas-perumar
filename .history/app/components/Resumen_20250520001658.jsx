"use client";
import { FaMoneyBillWave, FaUser, FaCalendarAlt } from "react-icons/fa";

export default function Resumen({ mesa, onClose }) {
  const subtotal = mesa.productos.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );
  const descuento = mesa.productos.reduce(
    (acc, p) => acc + (p.descuento || 0) * p.cantidad,
    0
  );
  const totalSinIva = subtotal - descuento;
  const iva = totalSinIva * 0.18;
  const totalConIva = totalSinIva + iva;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg w-full max-w-lg space-y-4 border border-white/10">
        <h2 className="text-xl font-bold text-orange-400 flex gap-2 items-center">
          <FaUser /> Cliente: {mesa.cliente}
        </h2>
        <p className="flex items-center gap-2 text-sm">
          <FaCalendarAlt /> Hora: {mesa.hora}
        </p>

        <div className="border-t border-white/20 pt-4">
          <h3 className="font-semibold mb-2">Resumen del pedido:</h3>
          <ul className="text-sm list-disc list-inside space-y-1">
            {mesa.productos.map((prod, idx) => (
              <li key={idx}>
                {prod.nombre} x {prod.cantidad}{" "}
                {prod.adicionales?.length > 0 &&
                  `+ ${prod.adicionales.join(", ")}`}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-right text-sm space-y-1 border-t border-white/20 pt-4">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Descuento: -${descuento.toFixed(2)}</p>
          <p>IVA (18%): +${iva.toFixed(2)}</p>
          <p className="font-bold text-lg text-cyan-300">
            Total: ${totalConIva.toFixed(2)}
          </p>
        </div>

        <div className="mt-4">
          <label className="block mb-1 text-sm font-medium">
            <FaMoneyBillWave className="inline-block mr-1" />
            Forma de pago
          </label>
          <select
            defaultValue={mesa.metodoPago}
            className="w-full px-3 py-2 border rounded-xl bg-white/10 text-white border-white/20"
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <button className="bg-green-600 hover:bg-green-700 py-2 rounded-xl">
            Generar Ticket PDF
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 py-2 rounded-xl">
            Enviar por WhatsApp
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-red-600 hover:bg-red-700 py-2 rounded-xl"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
