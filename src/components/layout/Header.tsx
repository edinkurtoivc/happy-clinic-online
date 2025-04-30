
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { LogOut, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface HeaderProps {
  title: string;
}

export default function Header({
  title
}: HeaderProps) {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  
  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center">
        {isMobile && (
          <img 
            src="/lovable-uploads/44afc1d2-0672-4a2d-acdd-3d4de4007dbb.png" 
            alt="EIBS Logo" 
            className="h-16 w-16" 
          />
        )}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      
      {user && (
        <div className="flex items-center space-x-2">
          <Link to="/settings">
            <Avatar className="h-9 w-9 border-2 border-clinic-500 hover:border-clinic-600 transition-all cursor-pointer">
              <AvatarFallback className="bg-clinic-100 text-clinic-700 font-medium">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout} 
            title="Odjava"
          >
            <LogOut className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Odjava</span>
          </Button>
        </div>
      )}
    </div>
  );
}
