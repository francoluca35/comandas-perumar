"use client";

import PrivateRoute from "../components/PrivateRoute";
import { useAuth } from "@/context/AuthContext";

export default function Page() {
  const { logout } = useAuth();

  return (
    <main className="p-6 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">hola 👋</h1>

      <button
        onClick={logout}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Cerrar sesión
      </button>
    </main>
  );
}
