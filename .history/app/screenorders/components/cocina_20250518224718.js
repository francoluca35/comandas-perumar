"use client";
import usePedidosCocina from "@/app/hooks/usePedidosCocina";

export default function Cocina() {
  const { pedidos, loading } = usePedidosCocina();

  if (loading) return <p className="text-white">Cargando pedidos...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📋 Órdenes en Cocina
      </h1>
      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <div
            key={pedido._id}
            className="bg-white/10 p-4 rounded-lg border border-white/20 shadow"
          >
            <p className="text-lg font-semibold">Orden #{pedido.orden}</p>
            <p className="text-sm text-gray-300">Mesa: {pedido.mesa}</p>
            <p className="text-sm text-gray-400">
              Hora: {new Date(pedido.hora).toLocaleTimeString()}
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-cyan-200">
              {pedido.productos.map((item, i) => (
                <li key={i}>
                  {item.nombre} x {item.cantidad}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
