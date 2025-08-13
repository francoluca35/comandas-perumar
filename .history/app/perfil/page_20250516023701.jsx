"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Carga dinámica del componente con client-side rendering forzado
const ModificatedProfile = dynamic(
  () => import("./components/ModificatedProfile"),
  {
    ssr: false,
  }
);

export default function Perfil() {
  return (
    <Suspense
      fallback={
        <div className="text-white text-center mt-20">Cargando perfil...</div>
      }
    >
      <ModificatedProfile />
    </Suspense>
  );
}
