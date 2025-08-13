import UserDropdown from "@/app/components/ui/UserDropdown";
import ModificatedProfile from "./components/ModificatedProfile";

export default function PerfilPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* NAVBAR */}
      <div className="w-full h-16 bg-black flex justify-end items-center px-6">
        <UserDropdown />
      </div>

      {/* CONTENIDO */}
      <div className="flex items-center justify-center px-4">
        <ModificatedProfile />
      </div>
    </div>
  );
}
