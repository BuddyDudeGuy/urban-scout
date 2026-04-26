/*
 * tiny render-time formatters for place data
 * none of these write to the database - they take strings the API already returned
 * and reformat them for display so the cards look nicer
 */

/*
 * convert a single "HH:MM" 24-hour time into a "h:MM AM/PM" 12-hour string
 * handles the two tricky edge cases:
 *   00:00 → "12:00 AM" (midnight)
 *   12:00 → "12:00 PM" (noon)
 * if the input doesn't look like HH:MM, returns null so the caller can fall back
 */
export function format12Hour(timeStr) {
  if (!timeStr) return null;
  const [hStr, mStr] = String(timeStr).trim().split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

/*
 * format an hours range like "09:00-18:00" into "9:00 AM – 6:00 PM"
 * if anything looks off we just return the original string verbatim
 * so weird db values still render harmlessly
 */
export function formatHoursRange(hours) {
  if (!hours) return '';
  const parts = String(hours).split('-');
  if (parts.length !== 2) return hours;
  const start = format12Hour(parts[0]);
  const end = format12Hour(parts[1]);
  if (!start || !end) return hours;
  return `${start} – ${end}`;
}

/*
 * uppercase the first letter of a string - used to capitalize place-type tags
 * like "transit" → "Transit" without touching the database value
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
