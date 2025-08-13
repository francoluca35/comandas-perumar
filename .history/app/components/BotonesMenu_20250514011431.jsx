"use client";

import { useRouter } from "next/navigation";
import {
  FaChartBar,
  FaConciergeBell,
  FaChair,
  FaPlusSquare,
} from "react-icons/fa";

export default function BotonesMenu() {
  const router = useRouter();

  const botones = [
    {
      icono: <FaChartBar size={20} />,
      texto: "Estadísticas",
      color: "bg-white text-gray-900",
      ruta: "/estadisticas",
    },
    {
      icono: <FaConciergeBell size={20} />,
      texto: "Pedidos",
      color: "bg-orange-600 text-white",
      ruta: "/pedidos",
    },
    {
      icono: <FaChair size={20} />,
      texto: "Mesas",
      color: "bg-white text-gray-900",
      ruta: "/mesas",
    },
    {
      icono: <FaPlusSquare size={20} />,
      texto: "Menu nuevo",
      color: "bg-orange-600 text-white",
      ruta: "/addmenu",
    },
  ];

  return (
    <div className="space-y-4 w-full max-w-sm mt-8">
      {botones.map((btn, i) => (
        <button
          key={i}
          onClick={() => router.push(btn.ruta)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold shadow-md hover:scale-[1.01] transition-transform duration-200 ${btn.color}`}
        >
          {btn.icono}
          {btn.texto}
        </button>
      ))}
    </div>
  );
}
