/*
 * itinerary list page - shows all the user's trip plans
 * can create new itineraries and click into them to manage items
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ItineraryPage() {
  const [itineraries, setItineraries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  /*
   * fetch all itineraries for the current user
   */
  const loadItineraries = async () => {
    const res = await api.get('/api/itineraries');
    setItineraries(res.data);
  };

  useEffect(() => { loadItineraries(); }, []);

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
  };

  /*
   * delete an itinerary
   */
  const handleDelete = async (id) => {
    await api.delete(`/api/itineraries/${id}`);
    loadItineraries();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-6">

      {/* header with title and new button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">My Itineraries</h1>
          <p className="text-sm text-[#6B7280]">Plan your trips and add places to visit</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] cursor-pointer px-5 py-2 text-sm font-semibold"
        >
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {/* create form - pops open when you hit + New */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl bg-white shadow-sm p-5 mb-6">
          <input
            type="text"
            placeholder="Trip name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 focus:ring-2 focus:ring-[#3B82F6] outline-none border border-gray-300 rounded-lg mb-3"
            required
          />
          <div className="flex gap-2 mb-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 p-2.5 focus:ring-2 focus:ring-[#3B82F6] outline-none border border-gray-300 rounded-lg cursor-pointer"
              required
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 p-2.5 focus:ring-2 focus:ring-[#3B82F6] outline-none border border-gray-300 rounded-lg cursor-pointer"
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] cursor-pointer w-full py-2.5 font-semibold"
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
      {itineraries.map(it => (
        <div key={it.ItineraryID} className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 mb-4">
          <div className="flex justify-between items-start">
            <Link to={`/itineraries/${it.ItineraryID}`} className="flex-1">
              <h3 className="font-bold">{it.title}</h3>
              <p className="text-sm text-gray-500">
                {it.start_date} — {it.end_date}
              </p>
            </Link>
            <button
              onClick={() => handleDelete(it.ItineraryID)}
              className="text-red-400 hover:text-red-600 cursor-pointer transition-colors text-sm ml-2"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
