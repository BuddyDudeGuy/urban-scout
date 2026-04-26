/*
 * single itinerary item card - has a view mode and an inline edit mode
 * scheduled items show a chunky date column on the left, unscheduled items
 * show a "Schedule" button that flips the card into edit mode
 */
import { Link } from 'react-router-dom';
import DateTimePicker from './DateTimePicker';

/*
 * helper - figures out whether a planned_time is real or a zero-date placeholder
 * the backend sometimes hands back 0000-00-00 style values for "not set"
 */
function isScheduled(plannedTime) {
  if (!plannedTime) return false;
  const d = new Date(plannedTime);
  return d.getFullYear() > 2000;
}

/*
 * format the chunky day-of-week / month-day / time block for the left rail
 * returns three strings the card layout slots in
 */
function formatScheduleParts(plannedTime) {
  const d = new Date(plannedTime);
  const dow = d.toLocaleDateString(undefined, { weekday: 'short' });
  const monthDay = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return { dow, monthDay, time };
}

export default function ItineraryItemCard({
  item,
  itineraryStart,
  itineraryEnd,
  editing,
  editNotes,
  editTime,
  onStartEdit,
  onChangeEditNotes,
  onChangeEditTime,
  onSaveEdit,
  onCancelEdit,
  onClearTime,
  onRemove,
}) {

  /*
   * edit mode - notes textarea + datetime picker + save/cancel/unschedule row
   */
  if (editing) {
    return (
      <div className="rounded-xl bg-white shadow-sm p-4 mb-3 border-2 border-[#3B82F6]">
        <textarea
          value={editNotes}
          onChange={(e) => onChangeEditNotes(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-[#3B82F6] outline-none"
          rows={2}
          placeholder="Notes"
        />
        <div className="mb-3">
          <DateTimePicker
            label="Date and time"
            value={editTime}
            onChange={onChangeEditTime}
            minDate={itineraryStart}
            maxDate={itineraryEnd}
          />
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={onSaveEdit}
            className="flex-1 rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="flex-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
        <div className="mt-2 text-right">
          <button
            onClick={onClearTime}
            className="text-xs text-[#6B7280] hover:text-red-500 underline cursor-pointer"
          >
            Mark as unscheduled
          </button>
        </div>
      </div>
    );
  }

  /*
   * view mode - left date rail + right place name / notes / actions
   */
  const scheduled = isScheduled(item.planned_time);
  const parts = scheduled ? formatScheduleParts(item.planned_time) : null;

  return (
    <div className="rounded-xl bg-white shadow-sm p-4 mb-3 flex gap-4">
      {/* left date column - scheduled view shows day/date/time, unscheduled shows the schedule button */}
      <div className="w-24 shrink-0">
        {scheduled ? (
          <>
            <div className="text-xs text-gray-500">{parts.dow}</div>
            <div className="text-lg font-bold text-[#1E3A5F] leading-tight">{parts.monthDay}</div>
            <div className="text-sm font-medium text-[#3B82F6] mt-1">{parts.time}</div>
          </>
        ) : (
          <div>
            <div className="text-xs italic text-gray-400">Not scheduled</div>
            <button
              onClick={() => onStartEdit(item)}
              className="rounded-full bg-[#1E3A5F] text-white text-xs px-3 py-1 mt-2 font-semibold cursor-pointer hover:bg-[#2d5a8e] transition-colors"
            >
              Schedule
            </button>
          </div>
        )}
      </div>

      {/* right content column - place link, notes, edit/remove buttons */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            {item.place_name && (
              <Link
                to={`/places/${item.PlaceID}`}
                className="font-semibold text-[#3B82F6] hover:underline cursor-pointer"
              >
                {item.place_name}
              </Link>
            )}
            {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onStartEdit(item)}
              className="text-[#1E3A5F] hover:text-[#3B82F6] cursor-pointer transition-colors text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onRemove(item.ItemNo)}
              className="text-red-400 hover:text-red-600 cursor-pointer transition-colors text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
