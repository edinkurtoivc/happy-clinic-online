
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function AppearanceSettings() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    toast({
      title: "Tema promijenjena",
      description: `Prebačeno na ${newTheme === 'light' ? 'svijetlu' : 'tamnu'} temu`,
    });
  };


  const [reportFontScale, setReportFontScale] = useState<number>(() => {
    const saved = localStorage.getItem('reportFontScale');
    const num = saved ? parseFloat(saved) : 1;
    return isNaN(num) ? 1 : num;
  });

  const applyReportFontScale = (val: number) => {
    setReportFontScale(val);
    localStorage.setItem('reportFontScale', String(val));
    try { window.dispatchEvent(new CustomEvent('reportFontScale:changed', { detail: { scale: val } })); } catch {}
    toast({ title: "Veličina fonta ažurirana", description: `Skala: ${Math.round(val * 100)}%` });
  };

  type ReportStyle = { headingFont: 'heading' | 'sans'; sectionBackground: boolean; showQr: boolean; showReportCode: boolean };
  const [reportStyle, setReportStyle] = useState<ReportStyle>(() => {
    try {
      const saved = localStorage.getItem('reportStyle');
      const parsed = saved ? JSON.parse(saved) : null;
      return {
        headingFont: parsed?.headingFont === 'sans' ? 'sans' : 'heading',
        sectionBackground: parsed?.sectionBackground !== false,
        showQr: parsed?.showQr !== false,
        showReportCode: parsed?.showReportCode !== false,
      } as ReportStyle;
    } catch {
      return { headingFont: 'heading', sectionBackground: true, showQr: true, showReportCode: true };
    }
  });

  const applyReportStyle = (partial: Partial<ReportStyle>) => {
    const next = { ...reportStyle, ...partial } as ReportStyle;
    setReportStyle(next);
    localStorage.setItem('reportStyle', JSON.stringify(next));
    try { window.dispatchEvent(new CustomEvent('reportStyle:changed', { detail: { style: next } })); } catch {}
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
          <h3 className="text-lg font-medium mb-2">Nalaz — veličina fonta</h3>
          <p className="text-sm text-muted-foreground mb-3">Povećajte ili smanjite veličinu teksta u prikazu/printu nalaza.</p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.9}
              max={1.3}
              step={0.05}
              value={reportFontScale}
              onChange={(e) => applyReportFontScale(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm tabular-nums">{Math.round(reportFontScale * 100)}%</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Nalaz — stil</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="heading-font">Font naslova</Label>
              <Select value={reportStyle.headingFont} onValueChange={(v) => applyReportStyle({ headingFont: v as 'heading' | 'sans' })}>
                <SelectTrigger id="heading-font" className="w-full">
                  <SelectValue placeholder="Odaberite font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heading">Playfair (klasični)</SelectItem>
                  <SelectItem value="sans">Sans-serif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="section-bg">Blaga pozadina sekcija</Label>
                <p className="text-xs text-muted-foreground">Uključuje diskretnu pozadinu iza teksta.</p>
              </div>
              <Switch id="section-bg" checked={reportStyle.sectionBackground} onCheckedChange={(val) => applyReportStyle({ sectionBackground: val })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-qr">Prikaži QR kod</Label>
                <p className="text-xs text-muted-foreground">QR u zaglavlju nalaza.</p>
              </div>
              <Switch id="show-qr" checked={reportStyle.showQr} onCheckedChange={(val) => applyReportStyle({ showQr: val })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-code">Prikaži broj nalaza</Label>
                <p className="text-xs text-muted-foreground">Identifikacioni kod u zaglavlju.</p>
              </div>
              <Switch id="show-code" checked={reportStyle.showReportCode} onCheckedChange={(val) => applyReportStyle({ showReportCode: val })} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
