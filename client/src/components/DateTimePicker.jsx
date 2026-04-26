/*
 * date + time picker - calendar popover with hour/minute selects below
 * value is a "YYYY-MM-DDTHH:mm" string (same format as <input type="datetime-local">)
 * keeps the visible input read-only so no garbage typing
 */
import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';

/*
 * parse "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD HH:mm:ss" into a local Date
 */
function parseISODateTime(str) {
  if (!str) return undefined;
  const normalized = str.replace(' ', 'T');
  const [datePart, timePart = '00:00'] = normalized.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh = 0, mm = 0] = timePart.split(':').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d, hh, mm);
}

/*
 * format a Date back to "YYYY-MM-DDTHH:mm"
 */
function toISODateTime(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

/*
 * pretty-format the visible value in the field
 * e.g. "Sat, Mar 21, 2026 · 9:00 AM"
 */
function formatDisplay(date) {
  if (!date) return '';
  const datePart = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
}

/*
 * 24 hours and 4 quarter-hours - keeps minute selection low-friction
 */
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

export default function DateTimePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Pick a date and time',
  label,
  id,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const initial = parseISODateTime(value);

  /*
   * draft state - what the user has picked but not yet committed
   * we only push the value up when they click OK or pick a fresh day
   */
  const [draftDate, setDraftDate] = useState(initial);
  const [draftHour, setDraftHour] = useState(initial?.getHours() ?? 9);
  const [draftMinute, setDraftMinute] = useState(initial?.getMinutes() ?? 0);

  /*
   * when the popover opens, sync drafts from the prop value
   * means the popover always reflects the current value when re-opened
   */
  useEffect(() => {
    if (open) {
      const parsed = parseISODateTime(value);
      setDraftDate(parsed);
      setDraftHour(parsed?.getHours() ?? 9);
      setDraftMinute(parsed?.getMinutes() ?? 0);
    }
  }, [open, value]);

  /*
   * outside-click and Escape handling - same as DatePicker
   */
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const disabled = [];
  if (minDate) disabled.push({ before: minDate });
  if (maxDate) disabled.push({ after: maxDate });

  /*
   * commit the draft - merges the day with the hour/minute selects
   * onChange gets the final ISO datetime string
   */
  const handleConfirm = () => {
    if (!draftDate) return;
    const final = new Date(
      draftDate.getFullYear(),
      draftDate.getMonth(),
      draftDate.getDate(),
      draftHour,
      draftMinute,
    );
    onChange(toISODateTime(final));
    setOpen(false);
  };

  return (
    <div className="w-full" ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          value={formatDisplay(initial)}
          placeholder={placeholder}
          onClick={() => setOpen(o => !o)}
          className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg cursor-pointer bg-white focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm"
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#1E3A5F] hover:text-[#3B82F6] cursor-pointer"
          aria-label="Open calendar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
            <DayPicker
              mode="single"
              selected={draftDate}
              onSelect={setDraftDate}
              disabled={disabled}
              defaultMonth={draftDate || minDate || new Date()}
              showOutsideDays
            />
            {/* time row - hour + minute selects with an OK button */}
            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-200">
              <span className="text-sm font-semibold text-[#1E3A5F]">Time</span>
              <select
                value={draftHour}
                onChange={(e) => setDraftHour(Number(e.target.value))}
                className="p-1.5 border border-gray-300 rounded-lg text-sm cursor-pointer bg-white focus:ring-2 focus:ring-[#3B82F6] outline-none"
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-gray-500">:</span>
              <select
                value={draftMinute}
                onChange={(e) => setDraftMinute(Number(e.target.value))}
                className="p-1.5 border border-gray-300 rounded-lg text-sm cursor-pointer bg-white focus:ring-2 focus:ring-[#3B82F6] outline-none"
              >
                {MINUTES.map(m => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!draftDate}
                className="ml-auto px-4 py-1.5 rounded-full bg-[#1E3A5F] text-white text-sm font-semibold cursor-pointer hover:bg-[#2d5a8e] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
