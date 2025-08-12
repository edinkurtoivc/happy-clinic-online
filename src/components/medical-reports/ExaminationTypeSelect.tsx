import { AlertTriangle } from "lucide-react";
import type { ExaminationType } from "@/types/medical-report";
import useExaminationTypes from "@/hooks/useExaminationTypes";

interface ExaminationTypeSelectProps {
  selectedExamType: string;
  onSelectExamType: (type: string) => void;
  examinationTypes?: ExaminationType[];
  disabled?: boolean;
}

export default function ExaminationTypeSelect({
  selectedExamType,
  onSelectExamType,
  examinationTypes,
  disabled,
}: ExaminationTypeSelectProps) {
  const { examTypes } = useExaminationTypes();
  const types: ExaminationType[] = examinationTypes?.length ? examinationTypes : examTypes;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Vrsta pregleda</label>
      <select
        className="w-full border rounded-md p-2"
        value={selectedExamType}
        onChange={(e) => onSelectExamType(e.target.value)}
        disabled={disabled}
      >
        <option value="">Odaberite vrstu pregleda</option>
        {types.map((type) => (
          <option key={type.id} value={type.name}>
            {type.name}
          </option>
        ))}
      </select>
      {!selectedExamType && (
        <p className="text-sm text-amber-600 mt-1">
          <AlertTriangle className="inline-block h-4 w-4 mr-1" />
          Vrsta pregleda je obavezna za spremanje nalaza
        </p>
      )}
    </div>
  );
}
