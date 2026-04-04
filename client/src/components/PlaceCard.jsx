/*
 * alltrails-style place card with image on top, hover zoom, and type badge overlay
 * used on PlacesPage to show places in a nice grid layout
 */
import { Link } from 'react-router-dom';

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
      <div className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white cursor-pointer group">
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={place.name}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium ${typeBadge[type]}`}>
            {type}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-bold">{place.name}</h3>
          <p className="text-gray-500 text-sm">{place.address}</p>
          {place.avg_cost_per_person && (
            <p className="text-sm text-gray-600 mt-2">~${place.avg_cost_per_person}/person</p>
          )}
          {place.hours && (
            <p className="text-sm text-gray-600 mt-1">{place.hours}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
