"use client";

import { useRouter } from "next/navigation";
import { FaChair, FaConciergeBell, FaChartBar, FaPlus } from "react-icons/fa";

export default function BotonesMenu() {
  const router = useRouter();

  const botones = [
    {
      texto: "Mesas",
      icono: <FaChair size={24} />,
      ruta: "/mesas",
    },
    {
      texto: "Pedidos",
      icono: <FaConciergeBell size={24} />,
      ruta: "/pedidos",
    },
    {
      texto: "Delivery",
      icono: <FaChartBar size={24} />,
      ruta: "/delivery",
    },
    {
      texto: "A. Menú",
      icono: <FaPlus size={24} />,
      ruta: "/addmenu",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 max-w-md w-full">
      {botones.map((btn, i) => (
        <button
          key={i}
          onClick={() => router.push(btn.ruta)}
          className="flex flex-col items-center justify-center bg-white text-black rounded-lg p-4 shadow-md hover:scale-105 transition-all duration-200"
        >
          <div className="mb-1">{btn.icono}</div>
          <span className="font-semibold text-sm">{btn.texto}</span>
        </button>
      ))}
    </div>
  );
}
