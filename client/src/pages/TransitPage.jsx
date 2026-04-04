/*
 * transit page - shows all transit routes and lets you pick a station to see its schedule
 * everything is click-based, no typing needed
 * clean text header at top, then content cards below
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function TransitPage() {
  const [routes, setRoutes] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  /*
   * load transit routes and transit stations on mount
   */
  useEffect(() => {
    api.get('/api/transit/routes').then(res => setRoutes(res.data));
    api.get('/api/places', { params: { type: 'transit' } }).then(res => setStations(res.data));
  }, []);

  /*
   * when a station is selected from the dropdown, fetch its schedule
   */
  const handleStationSelect = async (stationId) => {
    setSelectedStation(stationId);
    if (!stationId) { setSchedule(null); setNearbyPlaces([]); return; }
    const res = await api.get(`/api/transit/stations/${stationId}/schedule`);
    setSchedule(res.data);
    const nearbyRes = await api.get(`/api/transit/stations/${stationId}/nearby`);
    setNearbyPlaces(nearbyRes.data);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Transit</h1>
      <p className="text-gray-500 mb-6">View transit routes and check station arrival times</p>

        {/* transit routes list */}
        <h2 className="font-bold text-lg mb-3">Routes</h2>
        {routes.length === 0 && <p className="text-gray-400 mb-4">No routes found</p>}
        <div className="space-y-3 mb-6">
          {routes.map(r => (
            <div key={r.RouteID} className="rounded-xl bg-white shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <span className="font-medium">{r.route_name}</span>
                <span className="text-gray-400 text-sm">{r.service_hours}</span>
              </div>
            </div>
          ))}
        </div>

        {/* station schedule lookup - pick a station from dropdown */}
        <h2 className="font-bold text-lg mb-3">Check Arrivals &amp; Departures</h2>
        <div className="rounded-xl bg-white shadow-sm p-5">
          <select
            value={selectedStation}
            onChange={(e) => handleStationSelect(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4 bg-white cursor-pointer"
          >
            <option value="">Select a station...</option>
            {stations.map(s => (
              <option key={s.PlaceID} value={s.PlaceID}>
                {s.name} ({s.station_code})
              </option>
            ))}
          </select>

          {schedule && (
            <div className="space-y-4">

              {/* which routes serve this station */}
              {schedule.routes?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-600 mb-2">Serving Routes</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {schedule.routes.map(r => (
                      <span key={r.RouteID} className="bg-blue-100 text-blue-700 rounded-full px-2.5 py-1 text-xs">
                        {r.route_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* arrivals cards */}
              {schedule.arrivals?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-600 mb-2">Arrivals</h3>
                  {schedule.arrivals.map((a, i) => (
                    <div key={i} className="flex justify-between py-2 text-sm border-b last:border-0">
                      <span>{a.route_label} ({a.vehicle_type})</span>
                      <span className="text-gray-500">{a.arrival_time}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* departures cards */}
              {schedule.departures?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-600 mb-2">Departures</h3>
                  {schedule.departures.map((d, i) => (
                    <div key={i} className="flex justify-between py-2 text-sm border-b last:border-0">
                      <span>{d.route_label} ({d.vehicle_type})</span>
                      <span className="text-gray-500">{d.departure_time}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* nearby places pulled from the sp_nearby_places stored procedure */}
          {nearbyPlaces.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Nearby Places</h3>
              <div className="space-y-2">
                {nearbyPlaces.map((p, i) => (
                  <Link to={`/places/${p.PlaceID}`} key={i} className="block rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-gray-900">{p.name}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          p.placeType === 'landmark' ? 'bg-purple-100 text-purple-700' :
                          p.placeType === 'eatery' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{p.placeType}</span>
                      </div>
                      <span className="text-sm text-gray-400">{p.distance_m}m away</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

    </div>
  );
}
