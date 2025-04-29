
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function Header({
  title,
  action
}: HeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <h1 className="text-lg font-semibold text-clinic-800 md:text-xl">{title}</h1>
      
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
