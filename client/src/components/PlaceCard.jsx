/*
 * alltrails-style place card with image on top, hover zoom, and type badge overlay
 * used on PlacesPage to show places in a nice grid layout
 */
import { Link } from 'react-router-dom';
import { formatHoursRange, capitalize } from '../utils/placeFormat';

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

export default function PlaceCard({ place }) {
  const type = place.placeType || 'other';
  const imageUrl = placeImages[place.PlaceID] || defaultImage;

  return (
    <Link to={`/places/${place.PlaceID}`} className="block">
      <div className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer group">
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={place.name}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium ${typeBadge[type]}`}>
            {capitalize(type)}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-bold mb-2">{place.name}</h3>
          <div className="space-y-2">

            {/* address row with map-pin icon so users instantly see it's a location */}
            {place.address && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{place.address}</span>
              </div>
            )}

            {/* hours row with clock icon and a bold "Hours" label, formatted via shared util */}
            {place.hours && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span><span className="font-semibold text-gray-700">Hours · </span>{formatHoursRange(place.hours)}</span>
              </div>
            )}

            {/* cost row with dollar-sign icon, rounded to a clean integer */}
            {place.avg_cost_per_person != null && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Avg. ${Number(place.avg_cost_per_person).toFixed(0)} / person</span>
              </div>
            )}

          </div>
        </div>
      </div>
    </Link>
  );
}
