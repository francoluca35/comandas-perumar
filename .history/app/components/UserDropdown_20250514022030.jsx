"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function UserDropdown() {
  const { logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(closeTimeoutRef.current); // prevenir cierre
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 200); // pequeño delay
  };

  return (
    <div
      className="relative inline-block text-left"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Botón de usuario */}
      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:ring-2 hover:ring-orange-400 transition">
        CH
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-50">
          <ul className="py-1 text-sm">
            <li
              onClick={() => router.push("/perfil")}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              Cambiar datos
            </li>
            <li
              onClick={() => router.push("/cambiar-password")}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              Cambiar contraseña
            </li>
            <li
              onClick={logout}
              className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
            >
              Cerrar sesión
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
