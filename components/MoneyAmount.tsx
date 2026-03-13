import { cn } from "@/lib/utils";

type MoneyAmountProps = {
  value: number | null;
  className?: string;
};

export default function MoneyAmount({ value, className }: MoneyAmountProps) {
  if (value === null) {
    return <span className={cn("font-mono text-jacket-amber", className)}>N/A</span>;
  }

  return (
    <span className={cn("font-mono text-jacket-amber", className)}>
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }).format(value)}
    </span>
  );
}
