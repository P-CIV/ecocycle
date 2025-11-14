import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  className
}: StatCardProps) {
  const isGradient = className?.includes("from-") || className?.includes("to-");
  
  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-all", isGradient ? className : "bg-white")}>
      <CardContent className={cn("p-6", isGradient && "text-white")}>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className={cn("p-3 rounded-full backdrop-blur-sm", isGradient ? "bg-white/20" : "bg-primary/10")}>
              <Icon className={cn("w-6 h-6", isGradient ? "text-white" : "text-primary")} />
            </div>
            <div>
              <p className={cn("text-sm font-medium", isGradient ? "text-white/90" : "text-muted-foreground")}>{title}</p>
              <h3 className={cn("text-2xl font-bold tracking-tight", isGradient && "text-white")}>{value}</h3>
              {description && (
                <p className={cn("text-xs mt-1", isGradient ? "text-white/80" : "text-muted-foreground")}>{description}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center ${trend.isPositive ? (isGradient ? "text-green-200" : "text-green-500") : (isGradient ? "text-red-200" : "text-red-500")}`}>
              <span className="text-sm font-medium">
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
