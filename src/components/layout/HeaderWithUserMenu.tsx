
import Header from "@/components/layout/Header";
import UserMenu from "@/components/layout/UserMenu";

type HeaderWithUserMenuProps = {
  title: string;
};

export function HeaderWithUserMenu({ title }: HeaderWithUserMenuProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <Header title={title} />
      <div className="ml-auto">
        <UserMenu />
      </div>
    </div>
  );
}

export default HeaderWithUserMenu;
