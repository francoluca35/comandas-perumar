"use client";

import Boton from "./Boton";
import { FiMapPin, FiCheck } from "react-icons/fi";

export default function TarjetaPedido({
  pedido,
  onEntregar,
  entregado = false,
}) {
  return (
    <div
      className={`${
        entregado
          ? "bg-green-700/20 border border-green-600"
          : "bg-blue-900/20 border border-blue-700"
      } rounded-2xl p-5 mb-5 shadow-lg backdrop-blur-md`}
    >
      <p className="font-bold text-lg">Pedido ({pedido.nombre})</p>
      <p className="text-sm text-gray-300">Nmro de Orden: {pedido._id}</p>

      <div className="text-sm text-gray-200">
        {pedido.comidas?.map((item, idx) => (
          <div key={idx}>
            🍽 <strong>{item.comida}</strong>
            {item.adicionales?.length > 0 && (
              <span> + {item.adicionales.join(", ")}</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-300 mb-3">
        Dirección: {pedido.direccion}
      </p>
      <p className="text-sm text-gray-300 mb-3 font-bold">
        Total: ${pedido.total}
      </p>

      {pedido.horaEntrega && (
        <p className="text-sm text-gray-300 mb-3 -mt-2">
          Hora de entrega: {new Date(pedido.horaEntrega).toLocaleString()}
        </p>
      )}

      <div className="flex gap-4">
        <Boton color="gray">
          <a
            href={pedido.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            <FiMapPin /> Ver Mapa
          </a>
        </Boton>
        {entregado ? (
          <Boton disabled color="gray">
            <FiCheck /> Entregado
          </Boton>
        ) : (
          <Boton color="green" onClick={() => onEntregar(pedido._id)}>
            <FiCheck /> Entregar
          </Boton>
        )}
      </div>
    </div>
  );
}
