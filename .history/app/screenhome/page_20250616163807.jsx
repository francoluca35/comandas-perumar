"use client";

import { useState, useEffect, Suspense } from "react";
import PrivateRoute from "../models/PrivateRoute";
import { useAuth } from "@/context/AuthContext";
import TablaMetrica from "../components/ui/TablaMetrica";
import BotonesMenu from "../components/ui/BotonesMenu";
import UserDropdown from "../components/ui/UserDropdown";
import AbrirCaja from "../components/ui/AbrirCaja";
import CajaResumen from "../components/ui/CajaResumen";

export default function ScreenHome() {
  const { user } = useAuth();
  const fecha = new Date().toLocaleDateString("es-AR");
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const mostrarAlIniciar = sessionStorage.getItem("mostrarCaja");

    if (mostrarAlIniciar === "true") {
      setMostrarModal(true);
      sessionStorage.removeItem("mostrarCaja");
    }

    const handleAbrirCaja = () => {
      setMostrarModal(true);
    };

    window.addEventListener("abrirCaja", handleAbrirCaja);
    return () => {
      window.removeEventListener("abrirCaja", handleAbrirCaja);
    };
  }, []);

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 p-6 text-white flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-semibold">
            Bienvenido {user?.nombreCompleto} - {fecha}
          </h2>
          <UserDropdown onAbrirCaja={() => setMostrarModal(true)} />
        </div>

        {/* Aquí mostramos los datos de caja */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 flex-grow">
          <div>
            <CajaResumen /> {/* 👈  agregado */}
          </div>

          <Suspense
            fallback={<p className="text-gray-400">Cargando menú...</p>}
          >
            <BotonesMenu />
          </Suspense>
        </div>

        <AbrirCaja
          visible={mostrarModal}
          onClose={() => setMostrarModal(false)}
        />
      </main>
    </PrivateRoute>
  );
}
