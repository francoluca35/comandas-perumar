import UserDropdown from "@/app/components/ui/UserDropdown";
import ModificatedProfile from "./components/ModificatedProfile";

export default function PerfilPage() {
  return (
    <div className="min-h-screen flex flex-col ">
      {/* Barra superior */}
      <div className="h-16 w-full  flex justify-end items-center px-6">
        <UserDropdown />
      </div>

      {/* Contenido centrado */}
      <div className="">
        <ModificatedProfile />
      </div>
    </div>
  );
}
