/*
 * clickable card for a region - used on the home page
 * shows region name, description, and a subscribe/unsubscribe toggle
 * has hover effects on the card and button, plus a loading spinner
 */
import api from '../api';
import { useState } from 'react';

export default function RegionCard({ region, isSubscribed, onToggle }) {
  const [loading, setLoading] = useState(false);

  /*
   * toggle subscription on/off when the button is clicked
   */
  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isSubscribed) {
        await api.delete(`/api/subscriptions/${region.RegionID}`);
      } else {
        await api.post('/api/subscriptions', { regionId: region.RegionID });
      }
      onToggle();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{region.name}</h3>
          <p className="text-gray-500 text-sm mt-1">{region.description}</p>
          {region.boundary && (
            <p className="text-gray-400 text-xs mt-1">{region.boundary}</p>
          )}
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
            isSubscribed
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {loading ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>
    </div>
  );
}
