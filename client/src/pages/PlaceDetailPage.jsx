/*
 * detail page for a single place - shows all info, map, nearby stations
 * has an "add to itinerary" button that uses a dropdown (minimal typing)
 * hero image at top with smooth gradient overlay, then content cards below
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import MapView from '../components/MapView';

/*
 * maps each PlaceID to a relevant pexels image
 * fallback to a generic seoul photo if the id isn't in here
 */
const placeImages = {
  1: 'https://images.pexels.com/photos/11870589/pexels-photo-11870589.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  2: 'https://images.pexels.com/photos/31414677/pexels-photo-31414677.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  3: 'https://images.pexels.com/photos/5774152/pexels-photo-5774152.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  4: 'https://images.pexels.com/photos/5774145/pexels-photo-5774145.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  5: 'https://images.pexels.com/photos/31826589/pexels-photo-31826589.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  6: 'https://images.pexels.com/photos/31826589/pexels-photo-31826589.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  7: 'https://images.pexels.com/photos/18495179/pexels-photo-18495179.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
};

const defaultImage = 'https://images.pexels.com/photos/12640885/pexels-photo-12640885.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';

/*
 * badge colors so each place type gets its own vibe
 */
const typeBadge = {
  landmark: 'bg-purple-100 text-purple-700',
  eatery: 'bg-orange-100 text-orange-700',
  transit: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function PlaceDetailPage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState('');
  const [message, setMessage] = useState('');

  /*
   * grab the place details and the user's itineraries on mount
   * we need itineraries so they can pick one from the dropdown
   */
  useEffect(() => {
    api.get(`/api/places/${id}`).then(res => setPlace(res.data));
    api.get('/api/itineraries').then(res => setItineraries(res.data));
  }, [id]);

  /*
   * add this place to the selected itinerary
   * posts to the itinerary items endpoint and shows a quick confirmation
   */
  const handleAddToItinerary = async () => {
    if (!selectedItinerary) return;
    try {
      await api.post(`/api/itineraries/${selectedItinerary}/items`, {
        placeId: place.PlaceID,
        notes: `Visit ${place.name}`,
      });
      setMessage('Added to itinerary!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Failed to add');
    }
  };

  if (!place) return <div className="p-4">Loading...</div>;

  /*
   * parse coordinates string "lat,lng" into numbers for the map
   * some places might not have coordinates so we handle that gracefully
   */
  const coords = place.coordinates?.split(',').map(Number);
  const type = place.placeType || 'other';
  const imageUrl = placeImages[place.PlaceID] || defaultImage;

  return (
    <div className="pb-24">

      {/* hero image with gradient overlay, back link, type badge, and place name */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={imageUrl}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link
          to="/places"
          className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-black/60 transition-colors"
        >
          &larr; Back to Places
        </Link>
        <span className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-medium ${typeBadge[type]}`}>
          {type}
        </span>
        <h1 className="absolute bottom-4 left-4 right-4 text-white text-2xl font-bold drop-shadow-lg">
          {place.name}
        </h1>
      </div>

      {/* main content area below the hero */}
      <div className="max-w-3xl mx-auto px-4 pb-24 pt-6 space-y-4">

        {/* info card with address, hours, cost, station code */}
        <div className="rounded-xl bg-white shadow-sm p-5">
          <p className="text-gray-600">{place.address}</p>
          {place.hours && <p className="text-sm text-gray-500 mt-1">Hours: {place.hours}</p>}
          {place.avg_cost_per_person && (
            <p className="text-sm text-gray-500 mt-1">Avg cost: ${place.avg_cost_per_person}/person</p>
          )}
          {place.station_code && (
            <p className="text-sm text-gray-500 mt-1">Station code: {place.station_code}</p>
          )}
        </div>

        {/* map showing the place location, or fallback if no coords */}
        {coords && coords.length === 2 ? (
          <div className="rounded-xl overflow-hidden shadow-sm">
            <MapView lat={coords[0]} lng={coords[1]} name={place.name} />
          </div>
        ) : (
          <div className="rounded-xl bg-white shadow-sm p-5">
            <p className="text-gray-400 text-sm">Location data not available</p>
          </div>
        )}

        {/* nearby transit stations */}
        {place.nearbyStations?.length > 0 && (
          <div className="rounded-xl bg-white shadow-sm p-5">
            <h2 className="font-bold mb-2">Nearby Transit Stations</h2>
            {place.nearbyStations.map((s, i) => (
              <div key={i} className="flex justify-between py-1 text-sm">
                <span>{s.station_name} ({s.station_code})</span>
                <span className="text-gray-400">{s.distance_m}m</span>
              </div>
            ))}
          </div>
        )}

        {/* add to itinerary section - uses dropdown, no typing needed */}
        <div className="rounded-xl bg-white shadow-sm p-5">
          <h2 className="font-bold mb-1">Add to Itinerary</h2>
          <p className="text-gray-400 text-xs mb-3">Select an itinerary and tap Add to include this place in your trip plan</p>

          {itineraries.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No itineraries yet &mdash;{' '}
              <Link to="/itineraries" className="text-blue-500 hover:underline cursor-pointer">create one</Link>{' '}
              in the Trips tab
            </p>
          ) : (
            <div className="flex gap-2">
              <select
                value={selectedItinerary}
                onChange={(e) => setSelectedItinerary(e.target.value)}
                className="flex-1 p-2 border rounded-lg bg-white cursor-pointer"
              >
                <option value="">Select itinerary...</option>
                {itineraries.map(it => (
                  <option key={it.ItineraryID} value={it.ItineraryID}>{it.title}</option>
                ))}
              </select>
              <button
                onClick={handleAddToItinerary}
                className="bg-blue-500 text-white px-5 py-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Add
              </button>
            </div>
          )}
          {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
        </div>

      </div>
    </div>
  );
}
