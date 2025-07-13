// Utilitário para conversão segura de datas (Firestore Timestamp, Date, string)
export function toDateSafe(date: any): Date | null {
  if (!date) return null;
  if (typeof date.toDate === "function") return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === "string") {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function formatDatePT(date: any): string {
  const d = toDateSafe(date);
  return d ? d.toLocaleDateString("pt-PT") : "-";
}
