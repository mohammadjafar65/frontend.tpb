// utils/dates.js (or at top of your component)
const asDate = (v) => {
  if (!v) return null;
  // If it's just "YYYY-MM-DD", avoid timezone shift by appending midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(`${v}T00:00:00`);
  return new Date(v);
};

export const fmtDate = (v) =>
  asDate(v)?.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) || "—";

export const fmtDateTime = (v) =>
  asDate(v)?.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) || "—";
