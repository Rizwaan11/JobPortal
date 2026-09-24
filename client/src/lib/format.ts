type DateValue = string | number | Date | null | undefined;

function validDate(value: DateValue) {
  if (value === null || value === undefined || value === "") return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: DateValue, fallback: string | null = "—") {
  const date = validDate(value);
  if (!date) return fallback;

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateTime(
  value: DateValue,
  options: { fallback?: string; timeZone?: string } = {},
) {
  const date = validDate(value);
  if (!date) return options.fallback ?? "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    ...(options.timeZone ? { timeZone: options.timeZone } : {}),
  }).format(date);
}

export function formatDeadline(value: DateValue, fallback = "No deadline") {
  return formatDate(value, fallback) ?? fallback;
}

export function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
