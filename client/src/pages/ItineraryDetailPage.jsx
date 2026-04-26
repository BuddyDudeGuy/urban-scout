/*
 * detail page for a single itinerary - shows all items split into Scheduled
 * and Unscheduled sections with a chunky date-range header up top
 * uses auto-animate so items glide between sections when their time changes
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import api from '../api';
import ItineraryItemCard from '../components/ItineraryItemCard';
import PageHeader from '../components/PageHeader';

/*
 * parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss" into a local Date
 * avoids the UTC shift that new Date(str) does for date-only strings
 */
function parseISODate(str) {
  if (!str) return undefined;
  const datePart = String(str).split('T')[0].split(' ')[0];
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/*
 * format the date range like "Mar 21 – Mar 24" using Intl
 * if either side is missing we just stringify what we have
 */
function formatTimeRange(start, end) {
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  if (start && end) return `${fmt.format(start)} – ${fmt.format(end)}`;
  if (start) return fmt.format(start);
  if (end) return fmt.format(end);
  return '';
}

/*
 * convert a Date to "YYYY-MM-DDTHH:mm" using local components
 * (toISOString would shift to UTC and bump the day across timezones)
 */
function toLocalDateTimeString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export default function ItineraryDetailPage() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editTime, setEditTime] = useState('');

  /*
   * auto-animate refs - one per list so cards animate when shuffling between them
   */
  const [scheduledRef] = useAutoAnimate();
  const [unscheduledRef] = useAutoAnimate();

  /*
   * fetch the itinerary and its items from the backend
   */
  const loadItinerary = async () => {
    const res = await api.get(`/api/itineraries/${id}`);
    setItinerary(res.data);
  };

  useEffect(() => { loadItinerary(); }, [id]);

  /*
   * remove an item from the itinerary
   */
  const handleRemoveItem = async (itemNo) => {
    await api.delete(`/api/itineraries/${id}/items/${itemNo}`);
    loadItinerary();
  };

  /*
   * start editing an item - pre-fills the form with current values
   * if the item has no real planned_time we default to the trip's start date at 9am
   * so the picker isn't sitting on some random day
   */
  const handleStartEdit = (item) => {
    setEditingItem(item.ItemNo);
    setEditNotes(item.notes || '');

    const hasRealTime = item.planned_time && new Date(item.planned_time).getFullYear() > 2000;
    if (hasRealTime) {
      setEditTime(toLocalDateTimeString(new Date(item.planned_time)));
    } else {
      const start = parseISODate(itinerary?.start_date) || new Date();
      const defaultDate = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 9, 0);
      setEditTime(toLocalDateTimeString(defaultDate));
    }
  };

  /*
   * save the edited item - sends planned_time as null if the user cleared it
   */
  const handleSaveEdit = async () => {
    await api.put(`/api/itineraries/${id}/items/${editingItem}`, {
      planned_time: editTime || null,
      notes: editNotes,
    });
    setEditingItem(null);
    loadItinerary();
  };

  /*
   * cancel editing without saving
   */
  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  /*
   * mark the currently-edited item as unscheduled - keeps notes, drops the time
   */
  const handleClearTime = async () => {
    await api.put(`/api/itineraries/${id}/items/${editingItem}`, {
      planned_time: null,
      notes: editNotes,
    });
    setEditingItem(null);
    loadItinerary();
  };

  if (!itinerary) return <div className="p-4">Loading...</div>;

  /*
   * compute the date range header bits - end gets bumped to 23:59 so the picker
   * lets the user pick anything on the last day of the trip
   */
  const startDate = parseISODate(itinerary.start_date);
  const endDateRaw = parseISODate(itinerary.end_date);
  const endDate = endDateRaw
    ? new Date(endDateRaw.getFullYear(), endDateRaw.getMonth(), endDateRaw.getDate(), 23, 59)
    : undefined;
  const formattedRange = formatTimeRange(startDate, endDateRaw);
  const dayCount = startDate && endDateRaw
    ? Math.round((endDateRaw - startDate) / 86400000) + 1
    : 0;

  /*
   * split items - scheduled get sorted ascending by time, unscheduled stay in
   * whatever order the backend returned (usually ItemNo order)
   */
  const items = itinerary.items || [];
  const scheduled = items
    .filter(i => i.planned_time && new Date(i.planned_time).getFullYear() > 2000)
    .sort((a, b) => new Date(a.planned_time).getTime() - new Date(b.planned_time).getTime());
  const unscheduled = items.filter(i => !i.planned_time || new Date(i.planned_time).getFullYear() <= 2000);

  /*
   * one card builder used by both lists so editing/view state stays consistent
   */
  const renderCard = (item) => (
    <ItineraryItemCard
      key={item.ItemNo}
      item={item}
      itineraryStart={startDate}
      itineraryEnd={endDate}
      editing={editingItem === item.ItemNo}
      editNotes={editNotes}
      editTime={editTime}
      onStartEdit={handleStartEdit}
      onChangeEditNotes={setEditNotes}
      onChangeEditTime={setEditTime}
      onSaveEdit={handleSaveEdit}
      onCancelEdit={handleCancelEdit}
      onClearTime={handleClearTime}
      onRemove={handleRemoveItem}
    />
  );

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">

      <PageHeader
        title={itinerary.title}
        backLink={
          <Link
            to="/itineraries"
            className="text-[#1E3A5F] hover:underline cursor-pointer text-sm inline-flex items-center gap-1 mb-4"
          >
            ← Trips
          </Link>
        }
      />

      {/* prominent date range header with calendar icon and day count */}
      <div className="flex items-center gap-2 mb-6 p-4 rounded-xl bg-[#1E3A5F]/5 border-l-4 border-[#1E3A5F]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="text-base font-bold text-[#1E3A5F]">{formattedRange}</span>
        {dayCount > 0 && (
          <span className="text-sm text-gray-500">· {dayCount} days</span>
        )}
      </div>

      {/* empty state when there are zero items at all */}
      {items.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          No items yet. Browse{' '}
          <Link to="/places" className="text-[#3B82F6] hover:underline cursor-pointer">Places</Link>
          {' '}to add stops to your trip.
        </p>
      )}

      {/* scheduled items section - only renders the heading if there are items at all */}
      {items.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wide mt-6 mb-3">Schedule</h2>
          <div ref={scheduledRef}>
            {scheduled.map(renderCard)}
          </div>
        </>
      )}

      {/* unscheduled items section - only shows up if there's something to put in it */}
      {unscheduled.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wide mt-6 mb-3">Unscheduled</h2>
          <p className="text-xs text-gray-500 mb-3">Tap "Schedule" to add a date and time.</p>
          <div ref={unscheduledRef}>
            {unscheduled.map(renderCard)}
          </div>
        </>
      )}

      {/* help text when there are items - bottom of the page */}
      {items.length > 0 && (
        <p className="text-xs text-[#6B7280] mt-4">Tap 'Remove' to take a place off this itinerary</p>
      )}
    </div>
  );
}
