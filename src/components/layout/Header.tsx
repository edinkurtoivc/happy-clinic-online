
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title: string;
}

export default function Header({
  title
}: HeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center">
        {isMobile && (
          <img 
            src="/lovable-uploads/44afc1d2-0672-4a2d-acdd-3d4de4007dbb.png" 
            alt="EIBS Logo" 
            className="h-12 w-12" 
          />
        )}
      </div>
    </div>
  );
}
