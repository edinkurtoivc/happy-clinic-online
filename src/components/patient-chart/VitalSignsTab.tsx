import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface VitalSign {
  id: string;
  type: 'BP' | 'HR' | 'Temp' | 'SpO2' | 'RR';
  value: string; // e.g. "120/80" for BP, numeric strings for others
  unit?: string; // e.g. bpm, °C, %
  takenAt: string; // ISO
}

interface VitalSignsTabProps {
  items: VitalSign[];
  onChange: (next: VitalSign[]) => void;
}

export default function VitalSignsTab({ items, onChange }: VitalSignsTabProps) {
  const [type, setType] = React.useState<VitalSign['type']>('BP');
  const [value, setValue] = React.useState('');
  const [unit, setUnit] = React.useState('');

  const add = () => {
    if (!value.trim()) return;
    const entry: VitalSign = { id: `${Date.now()}`, type, value: value.trim(), unit: unit || undefined, takenAt: new Date().toISOString() };
    onChange([entry, ...items]);
    setValue('');
    setUnit('');
  };

  // Prepare chart data for numeric vitals (skip BP which is not single number)
  const numericTypes: VitalSign['type'][] = ['HR', 'Temp', 'SpO2', 'RR'];
  const chartData = items
    .filter(i => numericTypes.includes(i.type))
    .map(i => ({
      time: new Date(i.takenAt).toLocaleString(),
      type: i.type,
      value: Number(i.value.replace(',', '.')),
    }));

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid gap-2 md:grid-cols-5">
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="BP">Krvni pritisak (BP)</option>
            <option value="HR">Puls (HR)</option>
            <option value="Temp">Temperatura</option>
            <option value="SpO2">SpO₂</option>
            <option value="RR">Disanje (RR)</option>
          </select>
          <Input placeholder={type === 'BP' ? 'npr. 120/80' : 'npr. 72'} value={value} onChange={(e) => setValue(e.target.value)} />
          <Input placeholder="Jedinica (opcionalno)" value={unit} onChange={(e) => setUnit(e.target.value)} />
          <div className="md:col-span-1" />
          <Button onClick={add}>Dodaj</Button>
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left">Vrsta</th>
                <th className="px-4 py-2 text-left">Vrijednost</th>
                <th className="px-4 py-2 text-left">Vrijeme</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-b">
                  <td className="px-4 py-2">
                    {i.type === 'BP' ? <Badge>BP</Badge> : i.type === 'HR' ? <Badge>HR</Badge> : i.type === 'Temp' ? <Badge>Temp</Badge> : i.type === 'SpO2' ? <Badge>SpO₂</Badge> : <Badge>RR</Badge>}
                  </td>
                  <td className="px-4 py-2">{i.value} {i.unit}</td>
                  <td className="px-4 py-2">{new Date(i.takenAt).toLocaleString()}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={3}>Nema unesenih vitalnih znakova</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" hide />
              <YAxis />
              <Tooltip />
              {numericTypes.map(t => (
                <Line key={t} type="monotone" dataKey={d => (d as any).type === t ? (d as any).value : null} name={t} stroke="#8884d8" dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
