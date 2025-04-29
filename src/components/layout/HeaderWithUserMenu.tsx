
import Header from "@/components/layout/Header";
import UserMenu from "@/components/layout/UserMenu";

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
          className="h-18 w-18 hidden md:block" 
        />
        <Header title={title} />
      </div>
      <div className="ml-auto">
        <UserMenu />
      </div>
    </div>
  );
}

export default HeaderWithUserMenu;
