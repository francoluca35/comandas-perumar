"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function UserDropdown() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => setOpen(!open);

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:ring-2 hover:ring-orange-400 transition"
      >
        CH
      </div>

      {open && (
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
