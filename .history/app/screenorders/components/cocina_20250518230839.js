"use client";
import { useEffect, useState } from "react";

export default function Cocina() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/cocina");
      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000); // actualizar cada 10s
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <p className="text-white text-center mt-10">Cargando pedidos...</p>;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🍽️ Pedidos en Cocina
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pedidos.map((pedido, idx) => (
          <div
            key={idx}
            className="bg-white text-black rounded-xl shadow-lg p-4 relative"
          >
            <div className="absolute top-2 right-3 text-sm text-gray-500">
              {pedido.hora}
            </div>

            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
              Mesa {pedido.mesa}
            </p>

            <p className="font-bold text-lg mb-1">{pedido.cliente}</p>

            <ul className="text-sm text-gray-800 space-y-1 mt-2">
              {pedido.productos.map((prod, i) => (
                <li key={i}>
                  {prod.nombre} x {prod.cantidad}
                  {prod.adicionales?.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {" "}
                      + {prod.adicionales.join(", ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-3">
              <span className="text-xs font-semibold text-orange-600">
                Estado: {pedido.estado}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
