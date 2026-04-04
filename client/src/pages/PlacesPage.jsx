/*
 * browse places page - shows landmarks, eateries, and transit stations
 * filter by type using toggle buttons (no typing needed - meets the minimal keyboard input requirement)
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import PlaceCard from '../components/PlaceCard';

export default function PlacesPage() {
  const [searchParams] = useSearchParams();
  const [places, setPlaces] = useState([]);
  const [type, setType] = useState('');
  const [regions, setRegions] = useState([]);
  const [regionId, setRegionId] = useState(searchParams.get('regionId') || '');

  /*
   * load regions for the dropdown filter
   * grabs the user's subscribed regions so they only see relevant ones
   */
  useEffect(() => {
    api.get('/api/subscriptions').then(res => setRegions(res.data));
  }, []);

  /*
   * fetch places whenever filters change
   * passes type and regionId as query params to the backend
   */
  useEffect(() => {
    const params = {};
    if (type) params.type = type;
    if (regionId) params.regionId = regionId;
    api.get('/api/places', { params }).then(res => setPlaces(res.data));
  }, [type, regionId]);

  /*
   * type filter buttons - clicking toggles the filter on/off
   * keeps things tap-friendly for mobile users
   */
  const typeFilters = [
    { label: 'All', value: '' },
    { label: 'Landmarks', value: 'landmark' },
    { label: 'Eateries', value: 'eatery' },
    { label: 'Transit', value: 'transit' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pb-24 pt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Places</h1>
      <p className="text-gray-500 mb-6">Discover landmarks, restaurants, and transit stations in your regions</p>

      <select
        value={regionId}
        onChange={(e) => setRegionId(e.target.value)}
        className="w-full p-2 border rounded-lg mb-3 bg-white cursor-pointer"
      >
        <option value="">Filter by Region</option>
        {regions.map(r => (
          <option key={r.RegionID} value={r.RegionID}>{r.name}</option>
        ))}
      </select>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {typeFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setType(f.value)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap cursor-pointer hover:opacity-80 transition-all ${
              type === f.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {places.length === 0 && (
        <p className="text-gray-400 text-center py-8">No places found. Try selecting a different region or filter.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map(place => (
          <PlaceCard key={place.PlaceID} place={place} />
        ))}
      </div>
    </div>
  );
}
