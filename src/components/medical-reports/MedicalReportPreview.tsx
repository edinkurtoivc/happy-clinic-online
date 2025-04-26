
import { Card } from "@/components/ui/card";

export default function MedicalReportPreview() {
  return (
    <Card className="p-6 font-[Inter] text-sm">
      {/* Header with clinic info */}
      <div className="text-right mb-8">
        <img 
          src="/placeholder.svg" 
          alt="Clinic Logo" 
          className="inline-block h-12 mb-2"
        />
        <h2 className="font-semibold text-lg">Spark Studio</h2>
        <p className="text-muted-foreground">
          Ozimice 1, Bihać<br />
          Email: spark.studio.dev@gmail.com<br />
          Tel: 387 61 123 456
        </p>
      </div>

      {/* Patient info */}
      <div className="mb-8">
        <p className="font-bold">Ime i prezime: John Doe</p>
        <p>Datum rođenja: 01.01.1990</p>
        <p>Spol: M</p>
        <p>JMBG: 0101990123456</p>
        <p className="mt-4">Datum nalaza: {new Date().toLocaleDateString('bs')}</p>
      </div>

      {/* Report content */}
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Nalaz</h3>
          <p className="whitespace-pre-wrap">
            Ovdje će biti prikazan tekst nalaza koji korisnik unosi...
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Terapija i preporuke</h3>
          <p className="whitespace-pre-wrap">
            Ovdje će biti prikazana terapija i preporuke...
          </p>
        </div>
      </div>
    </Card>
  );
}
