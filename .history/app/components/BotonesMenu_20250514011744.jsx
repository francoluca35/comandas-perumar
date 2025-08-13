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
    <div className="w-full max-w-sm space-y-4 mt-10">
      {botones.map((btn, i) => (
        <div
          key={i}
          className={`flex items-center px-4 py-3 rounded-lg shadow-md ${btn.color} transition-all duration-300 hover:scale-[1.01] cursor-pointer`}
          onClick={() => router.push(btn.ruta)}
        >
          <div className="mr-3">{btn.icono}</div>
          <span className="font-bold uppercase tracking-wide text-sm">
            {btn.texto}
          </span>
        </div>
      ))}
    </div>
  );
}
