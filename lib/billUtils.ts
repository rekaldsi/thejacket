/**
 * Pure client-safe bill utilities — no fs/path imports.
 * Import this in client components instead of lib/bills.ts to avoid Node.js module errors.
 */

export function daysUntilHearing(bill: { next_hearing: { date: string } | null }): number | null {
  if (!bill.next_hearing) return null;
  const diff = new Date(bill.next_hearing.date).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}
