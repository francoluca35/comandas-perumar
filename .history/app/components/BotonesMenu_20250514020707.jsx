"use client";

import { useRouter } from "next/navigation";
import { FaChair, FaConciergeBell, FaChartBar, FaPlus } from "react-icons/fa";

export default function BotonesMenu() {
  const router = useRouter();

  const botones = [
    { texto: "Mesas", icono: <FaChair size={24} />, ruta: "/mesas" },
    {
      texto: "Pedidos",
      icono: <FaConciergeBell size={24} />,
      ruta: "/pedidos",
    },
    { texto: "Delivery", icono: <FaChartBar size={24} />, ruta: "/delivery" },
    { texto: "A. Menú", icono: <FaPlus size={24} />, ruta: "/addmenu" },
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {botones.map((btn, i) => (
        <div
          key={i}
          className="bg-white text-black rounded-lg p-6 w-36 h-28 flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={() => router.push(btn.ruta)}
        >
          <div className="mb-2">{btn.icono}</div>
          <span className="font-bold text-sm text-center">{btn.texto}</span>
        </div>
      ))}
    </div>
  );
}
