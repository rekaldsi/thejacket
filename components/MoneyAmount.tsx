"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";

type MoneyAmountProps = {
  value: number | null;
  className?: string;
};

export default function MoneyAmount({ value, className }: MoneyAmountProps) {
  const { lang } = useLanguage();
  const d = translations[lang];

  if (value === null) {
    return <span className={cn("font-mono text-jacket-amber", className)}>{d.money_na}</span>;
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
