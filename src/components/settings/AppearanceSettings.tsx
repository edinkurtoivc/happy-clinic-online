
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Palette } from "lucide-react";

const colors = [
  { name: "Plava", value: "blue", class: "bg-blue-500" },
  { name: "Zelena", value: "green", class: "bg-green-500" },
  { name: "Ljubičasta", value: "purple", class: "bg-purple-500" },
  { name: "Roza", value: "pink", class: "bg-pink-500" },
  { name: "Narandžasta", value: "orange", class: "bg-orange-500" },
];

export default function AppearanceSettings() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedColor, setSelectedColor] = useState('blue');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    toast({
      title: "Tema promijenjena",
      description: `Prebačeno na ${newTheme === 'light' ? 'svijetlu' : 'tamnu'} temu`,
    });
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // In a real app, this would update the primary color in the theme
    toast({
      title: "Primarna boja promijenjena",
      description: "Nova boja je uspješno primijenjena",
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Izgled aplikacije</h2>
        <p className="text-muted-foreground">
          Prilagodite izgled aplikacije prema vašim potrebama
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Tema</h3>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Prebaci na tamnu temu
              </>
            ) : (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Prebaci na svijetlu temu
              </>
            )}
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Primarna boja</h3>
          <div className="grid grid-cols-5 gap-3">
            {colors.map((color) => (
              <button
                key={color.value}
                className={`h-12 rounded-md transition-all ${color.class} ${
                  selectedColor === color.value ? 'ring-2 ring-offset-2' : ''
                }`}
                onClick={() => handleColorChange(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
