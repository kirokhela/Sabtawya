const TZ = "Africa/Cairo";

function parts(date: Date) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  return map;
}

export function cairoYMD(date = new Date()) {
  const p = parts(date);
  return `${p.year}-${p.month}-${p.day}`; // YYYY-MM-DD
}

export function cairoHM(date = new Date()) {
  const p = parts(date);
  return `${p.hour}:${p.minute}`; // HH:mm
}

export function cairoWeekday(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long" }).format(date);
}

// تحويل "YYYY-MM-DD + HH:mm" (بتوقيت القاهرة) إلى Date (UTC instant)
export function cairoLocalToUTC(ymd: string, hm: string) {
  const [Y, M, D] = ymd.split("-").map(Number);
  const [h, m] = hm.split(":").map(Number);

  // instant الحالي
  const now = new Date();

  // نفس "مكونات" الوقت في القاهرة لكن interpreted as UTC
  const p = parts(now);
  const asUTC = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  const offsetMs = asUTC - now.getTime();

  // الوقت المطلوب في القاهرة
  const targetAsUTC = Date.UTC(Y, M - 1, D, h, m, 0);
  return new Date(targetAsUTC - offsetMs);
}

export function attendanceStatusForNowCairo(now = new Date()) {
  const ymd = cairoYMD(now);

  const startAt = cairoLocalToUTC(ymd, "16:00");
  const cutoffAt = cairoLocalToUTC(ymd, "16:45");

  if (now.getTime() > cutoffAt.getTime()) return "LATE" as const;
  return "ON_TIME" as const;
}
