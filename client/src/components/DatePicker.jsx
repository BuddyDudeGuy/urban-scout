/*
 * date-only picker - shows a read-only input with a calendar icon
 * clicking anywhere on the field opens a calendar popover
 * we keep the input read-only so users can't type bad dates
 */
import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';

/*
 * turn a "YYYY-MM-DD" string into a local-midnight Date object
 * doing it this way instead of new Date(str) avoids timezone shifting the day backwards
 */
function parseISODate(str) {
  if (!str) return undefined;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/*
 * format a Date object back into "YYYY-MM-DD" using local components
 * keeps it consistent with the parse helper above
 */
function toISODate(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/*
 * pretty-format the date the user sees in the field
 * e.g. "Sat, Mar 21, 2026" - clear and unambiguous
 */
function formatDisplay(date) {
  if (!date) return '';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Pick a date',
  label,
  id,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selected = parseISODate(value);

  /*
   * close the popover when the user clicks anywhere outside the wrapper
   * also closes when they hit Escape - standard popover behavior
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

  /*
   * build the disabled-days matcher for react-day-picker
   * accepts before/after rules so days outside the range are non-clickable
   */
  const disabled = [];
  if (minDate) disabled.push({ before: minDate });
  if (maxDate) disabled.push({ after: maxDate });

  /*
   * called when the user picks a day in the calendar
   * format back to ISO and close
   */
  const handleSelect = (date) => {
    if (!date) return;
    onChange(toISODate(date));
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
        {/* the visible input - read-only, click anywhere opens the calendar */}
        <input
          id={id}
          type="text"
          readOnly
          value={formatDisplay(selected)}
          placeholder={placeholder}
          onClick={() => setOpen(o => !o)}
          className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg cursor-pointer bg-white focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm"
        />
        {/* calendar icon button on the right edge - same toggle behavior */}
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

        {/* the calendar popover - absolutely positioned right under the field */}
        {open && (
          <div className="absolute z-50 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-2">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              disabled={disabled}
              defaultMonth={selected || minDate || new Date()}
              showOutsideDays
            />
          </div>
        )}
      </div>
    </div>
  );
}
