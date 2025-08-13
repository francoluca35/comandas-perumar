"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Swal from "sweetalert2"; // 👈 Agregamos Swal
import {
  LogOut,
  UserCog,
  Lock,
  User,
  ChartColumn,
  PersonStanding,
} from "lucide-react";

export default function UserDropdown() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);
  const triggerRef = useRef(null);
  const pathname = usePathname();

  const getInitials = (name) => {
    if (!name) return "CH";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(user?.nombreCompleto);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCerrarSesion = () => {
    Swal.fire({
      title: "¿Deseas actualizar el dinero en caja antes de salir?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, actualizar caja",
      cancelButtonText: "No, cerrar sesión",
    }).then((result) => {
      if (result.isConfirmed) {
        window.dispatchEvent(new Event("abrirCaja"));
        setOpen(false);
      } else {
        logout();
        router.push("/login");
        setOpen(false);
      }
    });
  };

  if (!user) return null;

  return (
    <div className="relative z-50">
      {/* Trigger */}
      <div
        ref={triggerRef}
        className="cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {user?.imagen ? (
          <Image
            src={user.imagen}
            alt="Foto de perfil"
            width={40}
            height={40}
            className="rounded-full object-cover border-2 border-white shadow-md"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-orange-400 transition">
            {initials}
          </div>
        )}
      </div>

      {/* Sidebar completo igual que tu código actual... */}

      <div
        onClick={handleCerrarSesion}
        className="mt-auto flex items-center gap-2 text-red-400 hover:text-red-600 cursor-pointer transition"
      >
        <LogOut size={18} />
        Cerrar sesión
      </div>
    </div>
  );
}
