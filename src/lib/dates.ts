export function startOfDay(d: Date = new Date()) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function startOfWeek(d: Date = new Date()) {
  const copy = startOfDay(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function endOfDay(d: Date = new Date()) {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}
