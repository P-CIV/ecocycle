import { cn } from "@/lib/utils";

type Period = "7d" | "30d" | "6m";

interface PeriodFilterProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
}

export function PeriodFilter({ selectedPeriod, onPeriodChange }: PeriodFilterProps) {
  const periods: { value: Period; label: string }[] = [
    { value: "7d", label: "7 jours" },
    { value: "30d", label: "30 jours" },
    { value: "6m", label: "6 mois" },
  ];

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="text-muted-foreground">Période :</span>
      <div className="flex items-center rounded-lg border bg-card">
        {periods.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onPeriodChange(value)}
            className={cn(
              "px-3 py-1 rounded-lg transition-colors",
              selectedPeriod === value
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
