/*
 * itinerary list page - shows all the user's trip plans
 * can create new itineraries and click into them to manage items
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import DatePicker from '../components/DatePicker';
import PageHeader from '../components/PageHeader';

/*
 * turn a date string into a local-midnight Date object
 * handles both "YYYY-MM-DD" and full ISO datetimes like "2026-03-21T00:00:00.000Z"
 * (mysql2 returns DATE columns as JS Dates which JSON-serialize to full ISO)
 * we slice the first 10 chars so timezones don't shift the day backwards
 */
function parseISODate(str) {
  if (!str) return undefined;
  const datePart = String(str).slice(0, 10);
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/*
 * format a start/end date pair into a short readable range like "Mar 21 – Mar 24"
 * also returns the inclusive day count so the card can show "· 4 days"
 * returns null if either side is missing so the caller can fall back to a placeholder
 */
function formatRange(start, end) {
  const s = parseISODate(start);
  const e = parseISODate(end);
  if (!s || !e) return null;
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  const range = `${fmt.format(s)} – ${fmt.format(e)}`;
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.round((e - s) / msPerDay) + 1;
  return { range, days };
}

export default function ItineraryPage() {
  const [itineraries, setItineraries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reminders, setReminders] = useState([]);

  /*
   * snapshot of "today" at local midnight - used as the floor for the date pickers
   * computed once per render so the picker can't pick days in the past
   */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /*
   * fetch all itineraries for the current user
   */
  const loadItineraries = async () => {
    const res = await api.get('/api/itineraries');
    setItineraries(res.data);
  };

  const loadReminders = async () => {
  const res = await api.get('/api/itineraries/reminders/upcoming');
  setReminders(Array.isArray(res.data) ? res.data : []);
};

  useEffect(() => { loadItineraries(); loadReminders(); }, []);

  /*
   * create a new itinerary
   */
  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/api/itineraries', {
      title,
      start_date: startDate,
      end_date: endDate,
    });
    setTitle('');
    setStartDate('');
    setEndDate('');
    setShowForm(false);
    loadItineraries();
    loadReminders();
  };

  /*
   * delete an itinerary
   */
  const handleDelete = async (id) => {
    await api.delete(`/api/itineraries/${id}`);
    loadItineraries();
    loadReminders();
  };

  /*
   * when the start date moves, make sure the end date isn't stranded before it
   * if the user already picked an end date that's now too early, just clear it
   */
  const handleStartChange = (val) => {
    setStartDate(val);
    if (endDate && val && parseISODate(endDate) < parseISODate(val)) {
      setEndDate('');
    }
  };

  /*
   * gate the Create button - all four conditions must hold before the user can submit
   */
  const trimmedTitle = title.trim();
  const canCreate =
    trimmedTitle.length > 0 &&
    !!startDate &&
    !!endDate &&
    parseISODate(endDate) >= parseISODate(startDate);

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">

      <PageHeader
        title="Trips"
        subtitle="Plan new itineraries or pick up where you left off."
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showForm ? 'Cancel' : '+ New'}
          </button>
        }
      />

      {reminders.length > 0 && (
  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
    <h2 className="font-semibold text-amber-900 mb-2">Upcoming Trip Reminder</h2>
    <div className="space-y-2">
      {reminders.map((trip) => (
        <div key={trip.ItineraryID} className="text-sm text-amber-800">
          <span className="font-medium">{trip.title}</span> starts on{' '}
          {new Date(trip.start_date).toLocaleDateString()}.
        </div>
      ))}
    </div>
  </div>
)}

      {/* create form - pops open when you hit + New */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl bg-white shadow-sm p-5 mb-6">
          <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Trip name</label>
          <input
            type="text"
            placeholder="Trip name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-3"
            required
          />
          <div className="flex flex-col gap-3 mb-3">
            <DatePicker
              id="trip-start"
              label="Start date"
              value={startDate}
              onChange={handleStartChange}
              minDate={today}
              placeholder="Pick a start date"
            />
            <DatePicker
              id="trip-end"
              label="End date"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate ? parseISODate(startDate) : today}
              placeholder="Pick an end date"
            />
          </div>
          <button
            type="submit"
            disabled={!canCreate}
            className="rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full py-3"
          >
            Create
          </button>
        </form>
      )}

      {/* empty state when no itineraries exist */}
      {itineraries.length === 0 && !showForm && (
        <p className="text-gray-400 text-center py-8">
          No itineraries yet. Tap '+ New' above to plan your next trip!
        </p>
      )}

      {/* itinerary cards */}
      {itineraries.map(it => {
        const range = formatRange(it.start_date, it.end_date);
        return (
          <div key={it.ItineraryID} className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 mb-4">
            <div className="flex justify-between items-start">
              <Link to={`/itineraries/${it.ItineraryID}`} className="flex-1">
                <h3 className="font-bold">{it.title}</h3>
                {range ? (
                  <p className="text-sm text-[#1E3A5F] font-medium flex items-center gap-1.5 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{range.range}</span>
                    <span className="text-gray-500 font-normal">{`· ${range.days} day${range.days === 1 ? '' : 's'}`}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Dates not set</p>
                )}
              </Link>
              <button
                onClick={() => handleDelete(it.ItineraryID)}
                className="text-red-400 hover:text-red-600 cursor-pointer transition-colors text-sm ml-2"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
