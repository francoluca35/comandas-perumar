import UserDropdown from "@/app/components/ui/UserDropdown";
import ModificatedProfile from "./components/ModificatedProfile";

export default function PerfilPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Barra superior */}
      <div className="h-16 w-full  flex justify-end items-center px-6 shadow-md">
        <UserDropdown />
      </div>

      {/* Contenido centrado */}
      <div className="flex-grow flex items-center justify-center px-4">
        <ModificatedProfile />
      </div>
    </div>
  );
}
