import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/utils";

interface ExportButtonProps {
  data: any[];
  filename: string;
  label?: string;
  disabled?: boolean;
}

export function ExportButton({ data, filename, label = "Exporter", disabled = false }: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => exportToCSV(data, filename)}
      disabled={disabled}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      {label}
    </Button>
  );
}