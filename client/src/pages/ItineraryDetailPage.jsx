/*
 * detail page for a single itinerary - shows all items with their linked places
 * can remove existing items from the trip
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function ItineraryDetailPage() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editTime, setEditTime] = useState('');

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
   */
  const handleStartEdit = (item) => {
    setEditingItem(item.ItemNo);
    setEditNotes(item.notes || '');
    setEditTime(item.planned_time ? new Date(item.planned_time).toISOString().slice(0, 16) : '');
  };

  /*
   * save the edited item
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
   * cancel editing
   */
  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  if (!itinerary) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-6">

      {/* back link to itinerary list */}
      <Link
        to="/itineraries"
        className="text-[#1E3A5F] hover:underline cursor-pointer text-sm inline-flex items-center gap-1 mb-4"
      >
        ← My Itineraries
      </Link>

      {/* itinerary title and date range */}
      <h1 className="text-xl font-bold mb-1">{itinerary.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {itinerary.start_date} — {itinerary.end_date}
      </p>

      {/* empty state when no items yet */}
      {itinerary.items?.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          No items yet. Browse{' '}
          <Link to="/places" className="text-[#3B82F6] hover:underline cursor-pointer">Places</Link>
          {' '}to add stops to your trip.
        </p>
      )}

      {/* itinerary item cards */}
      {itinerary.items?.map(item => (
        editingItem === item.ItemNo ? (
          <div key={item.ItemNo} className="rounded-xl bg-white shadow-sm p-4 mb-3 border-2 border-[#3B82F6]">
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-sm focus:ring-2 focus:ring-[#3B82F6] outline-none"
              rows={2}
              placeholder="Notes"
            />
            <input
              type="datetime-local"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-3 text-sm cursor-pointer focus:ring-2 focus:ring-[#3B82F6] outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-[#1E3A5F] text-white py-2 rounded-full text-sm font-semibold cursor-pointer hover:bg-[#2d5a8e] transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-full text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div key={item.ItemNo} className="rounded-xl bg-white shadow-sm p-4 mb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {item.place_name && (
                  <Link
                    to={`/places/${item.PlaceID}`}
                    className="font-semibold text-[#3B82F6] hover:underline"
                  >
                    {item.place_name}
                  </Link>
                )}
                {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}
                {item.planned_time && new Date(item.planned_time).getFullYear() > 2000 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.planned_time).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => handleStartEdit(item)}
                  className="text-[#1E3A5F] hover:text-[#3B82F6] cursor-pointer transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveItem(item.ItemNo)}
                  className="text-red-400 hover:text-red-600 cursor-pointer transition-colors text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )
      ))}

      {/* help text when there are items */}
      {itinerary.items?.length > 0 && (
        <p className="text-xs text-[#6B7280] mt-2">Tap 'Remove' to take a place off this itinerary</p>
      )}
    </div>
  );
}
