
import Header from "@/components/layout/Header";

type HeaderWithUserMenuProps = {
  title: string;
};

export function HeaderWithUserMenu({ title }: HeaderWithUserMenuProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/44afc1d2-0672-4a2d-acdd-3d4de4007dbb.png" 
          alt="EIBS Logo" 
          className="h-16 w-16 hidden md:block" 
        />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      {/* We need to include the user menu here */}
    </div>
  );
}

export default HeaderWithUserMenu;
