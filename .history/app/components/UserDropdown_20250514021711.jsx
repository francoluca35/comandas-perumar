"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserDropdown() {
  const { logout } = useAuth();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Botón redondo con las iniciales */}
      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:ring-2 hover:ring-orange-400 transition">
        CH
      </div>

      {/* Dropdown */}
      {isHovered && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50 animate-fade-in">
          <ul className="divide-y divide-gray-200">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => router.push("/perfil")}
            >
              Cambiar datos
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => router.push("/cambiar-password")}
            >
              Cambiar contraseña
            </li>
            <li
              className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
              onClick={logout}
            >
              Cerrar sesión
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
