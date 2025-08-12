import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import dataStorageService from "@/services/DataStorageService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReasonDialog } from "@/components/patient-chart/ReasonDialog";
import { ConfirmDialog } from "@/components/patient-chart/ConfirmDialog";
import { ResultEntryDialog, type ResultPayload } from "@/components/patient-chart/ResultEntryDialog";
import VitalSignsTab, { type VitalSign } from "@/components/patient-chart/VitalSignsTab";
import SectionPdfDialog from "@/components/patient-chart/SectionPdfDialog";
import html2pdf from "html2pdf.js";

interface ProblemItem { id: string; description: string; status: "active" | "resolved"; code?: string }
interface AllergyItem { id: string; substance: string; reaction?: string; severity?: "mild" | "moderate" | "severe" }
interface MedicationItem { id: string; name: string; dose?: string; route?: string; active: boolean }
interface OrderItem { id: string; type: 'lab' | 'imaging' | 'procedure'; name: string; status: 'draft' | 'ordered' | 'collected' | 'resulted' | 'cancelled'; scheduledAt?: string; resultId?: string }
interface ObservationItem { id: string; orderId: string; code: string; value: string; unit?: string; abnormal?: boolean; resultedAt: string; refLow?: string; refHigh?: string; refText?: string; note?: string }
interface ClinicalData { problems: ProblemItem[]; allergies: AllergyItem[]; medications: MedicationItem[]; orders: OrderItem[]; observations: ObservationItem[]; vitalSigns: VitalSign[] }

export default function PatientChart() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<any>(null);
  const [tab, setTab] = useState("overview");
  const [clinical, setClinical] = useState<ClinicalData>({ problems: [], allergies: [], medications: [], orders: [], observations: [], vitalSigns: [] });

  // form states
  const [problemText, setProblemText] = useState("");
  const [problemCode, setProblemCode] = useState("");
  const [allergySubstance, setAllergySubstance] = useState("");
  const [allergyReaction, setAllergyReaction] = useState("");
  const [allergySeverity, setAllergySeverity] = useState<"mild" | "moderate" | "severe" | "">("");
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medRoute, setMedRoute] = useState("");

  const [orderType, setOrderType] = useState<'lab'|'imaging'|'procedure'>('lab');
  const [orderName, setOrderName] = useState("");

  // dialogs and UI state
  const [reasonOpen, setReasonOpen] = useState(false);
  const reasonRef = useRef<{ onConfirm?: (reason: string) => void; title?: string; description?: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmRef = useRef<{ onConfirm?: (reason?: string) => void; title?: string; description?: string; requireReason?: boolean; destructive?: boolean } | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const resultOrderIdRef = useRef<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const pdfSections = [
    { id: 'overview', label: 'Pregled' },
    { id: 'vitals', label: 'Vitalni znakovi' },
    { id: 'problems', label: 'Problemi' },
    { id: 'allergies', label: 'Alergije' },
    { id: 'medications', label: 'Medikacija' },
    { id: 'orders', label: 'Nalozi' },
    { id: 'results', label: 'Rezultati' },
  ];
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);
  const [sortDir, setSortDir] = useState<'desc'|'asc'>('desc');

  const storageKey = useMemo(() => `clinical-${patientId}`, [patientId]);

  useEffect(() => {
    const load = async () => {
      const pts = await dataStorageService.getPatients();
      const found = pts.find((p: any) => String(p.id) === String(patientId));
      setPatient(found);
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) setClinical(JSON.parse(saved));
      } catch {}
    };
    load();
  }, [patientId, storageKey]);

  const persist = (next: ClinicalData, actionDesc: string) => {
    setClinical(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    try {
      const currentUser = localStorage.getItem('currentUser');
      const performedBy = currentUser ? `${JSON.parse(currentUser).firstName} ${JSON.parse(currentUser).lastName}` : 'unknown';
      const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      logs.push({
        id: Date.now(),
        action: 'update',
        entityType: 'patient',
        entityId: patientId || '',
        performedBy,
        performedAt: new Date().toISOString(),
        details: `Karton: ${actionDesc}`
      });
      localStorage.setItem('auditLogs', JSON.stringify(logs));
    } catch {}
  };

  // handlers
  const addProblem = () => {
    if (!problemText.trim()) return;
    const newProblem: ProblemItem = { id: `${Date.now()}`, description: problemText.trim(), status: 'active', code: (problemCode || undefined) };
    const next: ClinicalData = { ...clinical, problems: [newProblem, ...clinical.problems] };
    persist(next, `dodat problem '${problemText.trim()}'`);
    setProblemText(""); setProblemCode("");
    toast({ title: "Sačuvano", description: "Problem je dodat." });
  };
  const resolveProblem = (id: string) => {
    const next: ClinicalData = { ...clinical, problems: clinical.problems.map(p => p.id === id ? { ...p, status: 'resolved' as const } : p) };
    persist(next, `problem ${id} označen kao riješen`);
  };
  const deleteProblem = (id: string) => {
    const reason = window.prompt('Unesite razlog brisanja problema:');
    if (!reason) return;
    const next = { ...clinical, problems: clinical.problems.filter(p => p.id !== id) };
    persist(next, `problem ${id} obrisan. Razlog: ${reason}`);
  };

  const addAllergy = () => {
    if (!allergySubstance.trim()) return;
    const next = { ...clinical, allergies: [{ id: `${Date.now()}`, substance: allergySubstance.trim(), reaction: allergyReaction || undefined, severity: (allergySeverity || undefined) as any }, ...clinical.allergies] };
    persist(next, `dodata alergija '${allergySubstance.trim()}'`);
    setAllergySubstance(""); setAllergyReaction(""); setAllergySeverity("");
    toast({ title: "Sačuvano", description: "Alergija je dodata." });
  };
  const deleteAllergy = (id: string) => {
    const reason = window.prompt('Unesite razlog brisanja alergije:');
    if (!reason) return;
    const next = { ...clinical, allergies: clinical.allergies.filter(a => a.id !== id) };
    persist(next, `alergija ${id} obrisana. Razlog: ${reason}`);
  };

  const addMedication = () => {
    if (!medName.trim()) return;
    const next = { ...clinical, medications: [{ id: `${Date.now()}`, name: medName.trim(), dose: medDose || undefined, route: medRoute || undefined, active: true }, ...clinical.medications] };
    persist(next, `dodat lijek '${medName.trim()}'`);
    setMedName(""); setMedDose(""); setMedRoute("");
    toast({ title: "Sačuvano", description: "Lijek je dodat." });
  };
  const toggleMedication = (id: string) => {
    const next = { ...clinical, medications: clinical.medications.map(m => m.id === id ? { ...m, active: !m.active } : m) };
    persist(next, `lijek ${id} promjena statusa`);
  };
  const deleteMedication = (id: string) => {
    const reason = window.prompt('Unesite razlog brisanja lijeka:');
    if (!reason) return;
    const next = { ...clinical, medications: clinical.medications.filter(m => m.id !== id) };
    persist(next, `lijek ${id} obrisan. Razlog: ${reason}`);
  };

  // Orders & Results
  const addOrder = () => {
    if (!orderName.trim()) return;
    const newOrder: OrderItem = { id: `${Date.now()}`, type: orderType, name: orderName.trim(), status: 'ordered', scheduledAt: new Date().toISOString() };
    const next: ClinicalData = { ...clinical, orders: [newOrder, ...clinical.orders] };
    persist(next, `dodat nalog '${newOrder.name}' (${newOrder.type})`);
    setOrderName("");
    toast({ title: "Sačuvano", description: "Nalog je dodat." });
  };

  const setOrderStatus = (id: string, status: OrderItem['status']) => {
    const next: ClinicalData = { ...clinical, orders: clinical.orders.map(o => o.id === id ? { ...o, status } : o) };
    persist(next, `nalog ${id} status: ${status}`);
  };

  const enterResult = (orderId: string) => {
    const code = window.prompt('Šifra (npr. LOINC):');
    if (!code) return;
    const value = window.prompt('Vrijednost:');
    if (value == null) return;
    const unit = window.prompt('Jedinica (opcionalno):') || undefined;
    const abnormal = window.confirm('Označi kao abnormalno?');
    const obs: ObservationItem = { id: `${Date.now()}`, orderId, code, value, unit, abnormal, resultedAt: new Date().toISOString() };
    const next: ClinicalData = { 
      ...clinical, 
      observations: [obs, ...clinical.observations], 
      orders: clinical.orders.map(o => o.id === orderId ? { ...o, status: 'resulted', resultId: obs.id } : o)
    };
    persist(next, `rezultat unesen za nalog ${orderId}${abnormal ? ' (abnormal)' : ''}`);
    toast({ title: "Rezultat unesen", description: "Rezultat je sačuvan." });
  };

  if (!patient) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Karton pacijenta" />
        <div className="page-container">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Karton pacijenta" />
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-semibold">{patient.firstName} {patient.lastName}</h1>
          <p className="text-sm text-muted-foreground">JMBG: {patient.jmbg} • Tel: {patient.phone}</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Pregled</TabsTrigger>
            <TabsTrigger value="problems">Problemi</TabsTrigger>
            <TabsTrigger value="allergies">Alergije</TabsTrigger>
            <TabsTrigger value="medications">Medikacija</TabsTrigger>
            <TabsTrigger value="orders">Nalozi</TabsTrigger>
            <TabsTrigger value="results">Rezultati</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Datum rođenja</p>
                  <p className="font-medium">{patient.dob}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresa</p>
                  <p className="font-medium">{patient.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email || '-'}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="problems" className="space-y-4">
            <Card className="p-4">
              <div className="grid gap-2 md:grid-cols-4">
                <Input placeholder="Opis problema" value={problemText} onChange={(e) => setProblemText(e.target.value)} />
                <Input placeholder="ICD kod (opcionalno)" value={problemCode} onChange={(e) => setProblemCode(e.target.value)} />
                <div className="md:col-span-1"></div>
                <Button onClick={addProblem}>Dodaj</Button>
              </div>
            </Card>

            <Card className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left">Opis</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Kod</th>
                      <th className="px-4 py-2 text-right">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinical.problems.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="px-4 py-2">{p.description}</td>
                        <td className="px-4 py-2">
                          {p.status === 'active' ? <Badge>Aktivan</Badge> : <Badge variant="secondary">Riješen</Badge>}
                        </td>
                        <td className="px-4 py-2">{p.code || '-'}</td>
                        <td className="px-4 py-2 text-right space-x-2">
                          {p.status === 'active' && (
                            <Button variant="outline" size="sm" onClick={() => resolveProblem(p.id)}>Označi riješen</Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteProblem(p.id)}>Obriši</Button>
                        </td>
                      </tr>
                    ))}
                    {clinical.problems.length === 0 && (
                      <tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>Nema unesenih problema</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="allergies" className="space-y-4">
            <Card className="p-4">
              <div className="grid gap-2 md:grid-cols-5">
                <Input placeholder="Supstanca" value={allergySubstance} onChange={(e) => setAllergySubstance(e.target.value)} />
                <Input placeholder="Reakcija (opcionalno)" value={allergyReaction} onChange={(e) => setAllergyReaction(e.target.value)} />
                <Input placeholder="Težina (mild/moderate/severe)" value={allergySeverity} onChange={(e) => setAllergySeverity(e.target.value as any)} />
                <div className="md:col-span-1"></div>
                <Button onClick={addAllergy}>Dodaj</Button>
              </div>
            </Card>
            <Card className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left">Supstanca</th>
                      <th className="px-4 py-2 text-left">Reakcija</th>
                      <th className="px-4 py-2 text-left">Težina</th>
                      <th className="px-4 py-2 text-right">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinical.allergies.map((a) => (
                      <tr key={a.id} className="border-b">
                        <td className="px-4 py-2">{a.substance}</td>
                        <td className="px-4 py-2">{a.reaction || '-'}</td>
                        <td className="px-4 py-2">{a.severity || '-'}</td>
                        <td className="px-4 py-2 text-right">
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteAllergy(a.id)}>Obriši</Button>
                        </td>
                      </tr>
                    ))}
                    {clinical.allergies.length === 0 && (
                      <tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>Nema unesenih alergija</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            <Card className="p-4">
              <div className="grid gap-2 md:grid-cols-5">
                <Input placeholder="Naziv lijeka" value={medName} onChange={(e) => setMedName(e.target.value)} />
                <Input placeholder="Doza (npr. 5 mg)" value={medDose} onChange={(e) => setMedDose(e.target.value)} />
                <Input placeholder="Put (npr. oralno)" value={medRoute} onChange={(e) => setMedRoute(e.target.value)} />
                <div className="md:col-span-1"></div>
                <Button onClick={addMedication}>Dodaj</Button>
              </div>
            </Card>
            <Card className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left">Naziv</th>
                      <th className="px-4 py-2 text-left">Doza</th>
                      <th className="px-4 py-2 text-left">Put</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-right">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinical.medications.map((m) => (
                      <tr key={m.id} className="border-b">
                        <td className="px-4 py-2">{m.name}</td>
                        <td className="px-4 py-2">{m.dose || '-'}</td>
                        <td className="px-4 py-2">{m.route || '-'}</td>
                        <td className="px-4 py-2">{m.active ? <Badge>Aktivan</Badge> : <Badge variant="secondary">Neaktivan</Badge>}</td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => toggleMedication(m.id)}>{m.active ? 'Deaktiviraj' : 'Aktiviraj'}</Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMedication(m.id)}>Obriši</Button>
                        </td>
                      </tr>
                    ))}
                    {clinical.medications.length === 0 && (
                      <tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>Nema unesenih lijekova</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="p-4">
              <div className="grid gap-2 md:grid-cols-5">
                <Select value={orderType} onValueChange={(v) => setOrderType(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tip naloga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab">Lab</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="procedure">Procedura</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Naziv naloga" value={orderName} onChange={(e) => setOrderName(e.target.value)} />
                <div className="md:col-span-2" />
                <Button onClick={addOrder}>Dodaj nalog</Button>
              </div>
            </Card>
            <Card className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left">Naziv</th>
                      <th className="px-4 py-2 text-left">Tip</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-right">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinical.orders.map((o) => (
                      <tr key={o.id} className="border-b">
                        <td className="px-4 py-2">{o.name}</td>
                        <td className="px-4 py-2">
                          {o.type === 'lab' ? <Badge>Lab</Badge> : o.type === 'imaging' ? <Badge variant="secondary">Imaging</Badge> : <Badge variant="outline">Procedura</Badge>}
                        </td>
                        <td className="px-4 py-2">
                          {o.status === 'cancelled' ? <Badge variant="destructive">Otkazan</Badge> :
                           o.status === 'resulted' ? <Badge variant="secondary">Rezultiran</Badge> :
                           o.status === 'collected' ? <Badge variant="default">U obradi</Badge> :
                           o.status === 'ordered' ? <Badge variant="default">Naručen</Badge> :
                           <Badge variant="outline">Nacrt</Badge>}
                        </td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <Button variant="outline" size="sm" disabled={o.status !== 'ordered'} onClick={() => setOrderStatus(o.id, 'collected')}>Uzorkovan</Button>
                          <Button variant="outline" size="sm" disabled={!(o.status === 'ordered' || o.status === 'collected')} onClick={() => enterResult(o.id)}>Unesi rezultat</Button>
                          <Button variant="ghost" size="sm" className="text-destructive" disabled={o.status === 'resulted' || o.status === 'cancelled'} onClick={() => setOrderStatus(o.id, 'cancelled')}>Otkaži</Button>
                        </td>
                      </tr>
                    ))}
                    {clinical.orders.length === 0 && (
                      <tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>Nema naloga</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left">Šifra</th>
                      <th className="px-4 py-2 text-left">Vrijednost</th>
                      <th className="px-4 py-2 text-left">Nalog</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinical.observations.map((r) => {
                      const order = clinical.orders.find(o => o.id === r.orderId);
                      return (
                        <tr key={r.id} className="border-b">
                          <td className="px-4 py-2">{r.code}</td>
                          <td className="px-4 py-2">{r.value} {r.unit}</td>
                          <td className="px-4 py-2">{order ? order.name : r.orderId}</td>
                          <td className="px-4 py-2">{r.abnormal ? <Badge variant="destructive">Abnormal</Badge> : <Badge variant="secondary">Normal</Badge>}</td>
                        </tr>
                      );
                    })}
                    {clinical.observations.length === 0 && (
                      <tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>Nema rezultata</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
