"use client";

import { useRouter } from "next/navigation";
import {
  FaChair,
  FaConciergeBell,
  FaChartBar,
  FaPlus,
  FaCashRegister,
} from "react-icons/fa";
import { GiCookingPot } from "react-icons/gi";

export default function BotonesMenu() {
  const router = useRouter();

  const botonesSuperiores = [
    { texto: "Mesas", icono: <FaChair size={24} />, ruta: "/tavolo" },
    {
      texto: "N. Pedidos",
      icono: <FaConciergeBell size={24} />,
      ruta: "/pedido",
    },

    {
      texto: "Pedidos G",
      icono: <FaChartBar size={24} />,
      ruta: "/delivery",
    },

    {
      texto: "A. Comidas",
      icono: <FaPlus size={24} />,
      ruta: "/addmenu",
    },
    {
      texto: "Retirar Efectivo",
      icono: <FaCashRegister size={24} />,
      ruta: "/updatecaja",
    },
    {
      texto: "A. Mesas",
      icono: <FaChair size={24} />,
      ruta: "/addtavolo",
    },
  ];

  return (
    <div className="flex flex-col gap-6 items-center">
      {/* Botones en dos columnas */}
      <div className="grid grid-cols-2 gap-6">
        {botonesSuperiores.map((btn, i) => (
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
    </div>
  );
}
