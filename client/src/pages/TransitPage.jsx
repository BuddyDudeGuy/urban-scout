/*
 * transit page - shows all transit routes and lets you pick a station to see its schedule
 * everything is click-based, no typing needed
 * clean text header at top, then content cards below
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import PageHeader from '../components/PageHeader';
import { formatHoursRange, format12Hour, capitalize } from '../utils/placeFormat';

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
      <PageHeader
        title="Transit"
        subtitle="View transit routes and check station arrival times"
      />

        {/* transit routes list */}
        <h2 className="text-lg font-bold text-gray-900 mb-1">Transit Routes</h2>
        <p className="text-sm text-gray-500 mb-3">Public transit lines operating in your area</p>
        {routes.length === 0 && <p className="text-gray-400 text-center py-8">No routes found</p>}
        <div className="mb-6">
          {routes.map(r => (
            <div key={r.RouteID} className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 mb-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-[#1E3A5F]">
                    <rect x="4" y="3" width="16" height="14" rx="3" />
                    <line x1="4" y1="11" x2="20" y2="11" />
                    <line x1="8" y1="17" x2="6" y2="21" />
                    <line x1="16" y1="17" x2="18" y2="21" />
                    <circle cx="9" cy="14" r="0.5" fill="currentColor" />
                    <circle cx="15" cy="14" r="0.5" fill="currentColor" />
                  </svg>
                  <span className="font-semibold text-gray-900">{r.route_name}</span>
                </div>
                {r.service_hours && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#1E3A5F]">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Service Hours · {formatHoursRange(r.service_hours)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* station schedule lookup - pick a station from dropdown */}
        <h2 className="text-lg font-bold text-gray-900 mb-3">Check Arrivals &amp; Departures</h2>
        <div className="rounded-xl bg-white shadow-sm p-5 mb-4">
          <select
            value={selectedStation}
            onChange={(e) => handleStationSelect(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-4"
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
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Serving Routes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {schedule.routes.map(r => (
                      <span key={r.RouteID} className="bg-[#1E3A5F]/10 text-[#1E3A5F] rounded-full px-2.5 py-1 text-xs font-semibold">
                        {r.route_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* arrivals cards */}
              {schedule.arrivals?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Arrivals</p>
                  {schedule.arrivals.map((a, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-green-600">
                          <polyline points="7 7 12 12 7 17" />
                          <line x1="21" y1="12" x2="12" y2="12" />
                          <line x1="3" y1="3" x2="3" y2="21" />
                        </svg>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{a.route_label}</span>
                          <span className="ml-1.5 text-xs text-gray-400">{a.vehicle_type}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#1E3A5F]">{format12Hour(a.arrival_time)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* departures cards */}
              {schedule.departures?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Departures</p>
                  {schedule.departures.map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#3B82F6]">
                          <polyline points="17 7 12 12 17 17" />
                          <line x1="3" y1="12" x2="12" y2="12" />
                          <line x1="21" y1="3" x2="21" y2="21" />
                        </svg>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{d.route_label}</span>
                          <span className="ml-1.5 text-xs text-gray-400">{d.vehicle_type}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#1E3A5F]">{format12Hour(d.departure_time)}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        {/* nearby places pulled from the sp_nearby_places stored procedure */}
        {nearbyPlaces.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Nearby Places</h2>
            {nearbyPlaces.map((p, i) => (
              <Link to={`/places/${p.PlaceID}`} key={i} className="block rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-900">{p.name}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      p.placeType === 'landmark' ? 'bg-purple-100 text-purple-700' :
                      p.placeType === 'eatery' ? 'bg-orange-100 text-orange-700' :
                      p.placeType === 'transit' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{capitalize(p.placeType)}</span>
                  </div>
                  <span className="text-xs text-gray-500">{p.distance_m}m away</span>
                </div>
              </Link>
            ))}
          </div>
        )}

    </div>
  );
}
