
import { Bold, Italic, Underline, Signature, Stamp, Save, ShieldCheck, RefreshCw, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";

interface ReportEditorProps {
  reportText: string;
  therapyText: string;
  onReportChange: (text: string) => void;
  onTherapyChange: (text: string) => void;
  hasSignature: boolean;
  hasStamp: boolean;
  onToggleSignature: () => void;
  onToggleStamp: () => void;
  isSaved: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  onResetReport: () => void;
  onOpenVerification: () => void;
  saveStatus?: "saving" | "saved" | "error" | "offline" | "idle" | "pending";
  lastSaved?: Date | null;
  isSubmitting?: boolean;
  onSave?: () => void;
  onPrint?: () => void;
}

export default function ReportEditor({
  reportText,
  therapyText,
  onReportChange,
  onTherapyChange,
  hasSignature,
  hasStamp,
  onToggleSignature,
  onToggleStamp,
  isSaved,
  verificationStatus,
  onResetReport,
  onOpenVerification,
  saveStatus,
  lastSaved,
  isSubmitting,
  onSave,
  onPrint
}: ReportEditorProps) {
  return (
    <div className="w-full max-w-[560px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-emerald-600">Editor za nalaz</h2>
        {saveStatus && (
          <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
        )}
      </div>
      
      <div className="border rounded-md p-2 mb-4">
        <div className="flex gap-2 mb-2">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={isSaved}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={isSaved}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={isSaved}>
            <Underline className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md p-4 h-[300px] mb-6">
        <textarea 
          className="w-full h-full outline-none resize-none" 
          placeholder="Unesite tekst nalaza..."
          value={reportText}
          onChange={(e) => onReportChange(e.target.value)}
          disabled={isSaved || isSubmitting}
        />
      </div>
      
      <h2 className="text-xl font-semibold mb-4 text-emerald-600">Terapija i preporuke</h2>
      <div className="border rounded-md p-4 h-[200px] mb-4">
        <textarea 
          className="w-full h-full outline-none resize-none" 
          placeholder="Unesite terapiju i preporuke..."
          value={therapyText}
          onChange={(e) => onTherapyChange(e.target.value)}
          disabled={isSaved || isSubmitting}
        />
      </div>
      
      <div className="flex items-center space-x-4 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 ${hasSignature ? 'bg-emerald-100' : ''}`}
          onClick={onToggleSignature}
          disabled={isSaved || isSubmitting}
        >
          <Signature className="h-4 w-4" /> {hasSignature ? 'Potpis dodan' : 'Dodaj potpis'}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 ${hasStamp ? 'bg-emerald-100' : ''}`}
          onClick={onToggleStamp}
          disabled={isSaved || isSubmitting}
        >
          <Stamp className="h-4 w-4" /> {hasStamp ? 'Pečat dodan' : 'Dodaj pečat'}
        </Button>
      </div>

      {/* Always show buttons container to ensure they're visible */}
      <div className="flex space-x-2 mb-4">
        {/* Save button - only show when not saved and onSave is provided */}
        {!isSaved && onSave && (
          <Button 
            onClick={onSave}
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Spremi nalaz
          </Button>
        )}
        
        {/* Print button - Always show if onPrint function is provided */}
        {onPrint && (
          <Button 
            variant="outline" 
            onClick={onPrint}
            disabled={(!isSaved || verificationStatus !== 'verified')}
            title={!isSaved ? "Nalaz mora biti sačuvan prije printanja" : 
                  verificationStatus !== 'verified' ? "Nalaz mora biti verifikovan prije printanja" : ""}
            className="whitespace-nowrap"
          >
            <Printer className="h-4 w-4 mr-2" /> Print i PDF
          </Button>
        )}
      </div>
      
      {isSaved && (
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline"
            onClick={onResetReport}
          >
            Novi nalaz
          </Button>
          
          <div className="flex space-x-2">
            {/* Only show verification button if status is pending */}
            {verificationStatus === 'pending' && (
              <Button 
                variant="outline"
                className="border-green-500 text-green-600"
                onClick={onOpenVerification}
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verifikuj nalaz
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
