import { cn } from "@/app/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  color?: "indigo" | "green" | "blue" | "amber" | "red";
  className?: string;
}

const colorMap = {
  indigo: "bg-indigo-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export default function StatCard({ label, value, change, trend, icon, color = "indigo", className }: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={cn("text-xs mt-1 font-medium", trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500")}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "•"} {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorMap[color])}>
            <span className="text-white text-lg">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
