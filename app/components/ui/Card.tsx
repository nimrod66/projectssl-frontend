import { cn } from "@/app/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  accent?: "indigo" | "blue" | "green" | "amber" | "red" | "none";
}

const accentBorder = {
  indigo: "border-l-4 border-l-indigo-500",
  blue: "border-l-4 border-l-blue-500",
  green: "border-l-4 border-l-green-500",
  amber: "border-l-4 border-l-amber-500",
  red: "border-l-4 border-l-red-500",
  none: "",
};

export default function Card({ children, className, onClick, hover = false, accent = "none" }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-5 shadow-sm",
        hover && "cursor-pointer hover:shadow-md transition-shadow",
        accentBorder[accent],
        className
      )}
    >
      {children}
    </div>
  );
}
