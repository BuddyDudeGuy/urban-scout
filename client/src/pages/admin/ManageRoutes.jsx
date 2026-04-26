/*
 * admin manage routes page
 * lets admins add and remove transit routes, and link stops to each route
 * each route can have multiple (station, vehicle) pairs that act as its stops
 * matches up with the EER which had admins managing the transit routes
 */
import { useEffect, useState } from 'react';
import api from '../../api';
import PageHeader from '../../components/PageHeader';

export default function ManageRoutes() {
  const [routes, setRoutes] = useState([]);
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [expandedRouteId, setExpandedRouteId] = useState(null);

  /* form state for creating a new route */
  const [form, setForm] = useState({ route_name: '', service_hours: '' });

  /* track which stops belong to which route, keyed by RouteID */
  const [stopsByRoute, setStopsByRoute] = useState({});

  /* form state for adding a stop to the currently expanded route */
  const [stopForm, setStopForm] = useState({ StationID: '', TransitID: '' });

  /*
    load the initial data we need on mount
    routes for the list, stations and vehicles for the stop dropdowns
  */
  useEffect(() => {
    loadAll();
  }, []);

  /*
   * pull routes, stations, and vehicles in parallel for the form dropdowns
   */
  async function loadAll() {
    try {
      setLoading(true);
      const [routesRes, stationsRes, vehiclesRes] = await Promise.all([
        api.get('/api/transit/routes'),
        api.get('/api/places', { params: { type: 'transit' } }),
        api.get('/api/transit/vehicles'),
      ]);
      setRoutes(Array.isArray(routesRes.data) ? routesRes.data : []);
      setStations(Array.isArray(stationsRes.data) ? stationsRes.data : []);
      setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  /*
    pull the list of stops for one route on demand
    we only fetch this when the user expands a route to keep it cheap
  */
  async function loadStopsForRoute(routeId) {
    try {
      const res = await api.get(`/api/transit/routes/${routeId}/stations`);
      setStopsByRoute((prev) => ({ ...prev, [routeId]: res.data }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load stops.');
    }
  }

  /*
   * generic field change handler for the new-route form
   */
  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /*
   * generic field change handler for the add-stop form
   */
  function handleStopFormChange(e) {
    const { name, value } = e.target;
    setStopForm((prev) => ({ ...prev, [name]: value }));
  }

  /*
    create a new transit route
    only requires route_name, service_hours is optional
  */
  async function handleCreateRoute(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!form.route_name.trim()) {
      setError('Route name is required.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/transit/routes', {
        route_name: form.route_name.trim(),
        service_hours: form.service_hours.trim() || null,
      });
      setMessage('Route created successfully.');
      setForm({ route_name: '', service_hours: '' });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create route.');
    } finally {
      setSubmitting(false);
    }
  }

  /*
    delete a route, also clears any cached stops for that route
  */
  async function handleDeleteRoute(routeId) {
    setMessage('');
    setError('');

    try {
      await api.delete(`/api/transit/routes/${routeId}`);
      setMessage('Route deleted.');
      setStopsByRoute((prev) => {
        const next = { ...prev };
        delete next[routeId];
        return next;
      });
      if (expandedRouteId === routeId) setExpandedRouteId(null);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete route.');
    }
  }

  /*
    toggle a route's expanded state - first time we expand, fetch its stops
  */
  async function handleToggleExpand(routeId) {
    if (expandedRouteId === routeId) {
      setExpandedRouteId(null);
      return;
    }
    setExpandedRouteId(routeId);
    setStopForm({ StationID: '', TransitID: '' });
    if (!stopsByRoute[routeId]) {
      await loadStopsForRoute(routeId);
    }
  }

  /*
    add a stop (station + transit vehicle) to the expanded route
  */
  async function handleAddStop(e, routeId) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!stopForm.StationID || !stopForm.TransitID) {
      setError('Pick both a station and a transit vehicle.');
      return;
    }

    try {
      await api.post(`/api/transit/routes/${routeId}/stations`, {
        StationID: Number(stopForm.StationID),
        TransitID: Number(stopForm.TransitID),
      });
      setMessage('Stop added to route.');
      setStopForm({ StationID: '', TransitID: '' });
      await loadStopsForRoute(routeId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add stop.');
    }
  }

  /*
    remove a single stop from a route
  */
  async function handleRemoveStop(routeId, stationId, transitId) {
    setMessage('');
    setError('');

    try {
      await api.delete(`/api/transit/routes/${routeId}/stations`, {
        data: { StationID: stationId, TransitID: transitId },
      });
      setMessage('Stop removed.');
      await loadStopsForRoute(routeId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove stop.');
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">
      <PageHeader
        title="Manage Transit Routes"
        subtitle="Create and remove transit routes, and link stations and vehicles to each route."
      />

      {message && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* create route form */}
      <div className="rounded-xl bg-white shadow-sm p-5 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Add a New Route</h2>
        <form onSubmit={handleCreateRoute} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
              Route Name
            </label>
            <input
              type="text"
              name="route_name"
              value={form.route_name}
              onChange={handleFormChange}
              placeholder="e.g. Line 5 - Olympic"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
              Service Hours
            </label>
            <input
              type="text"
              name="service_hours"
              value={form.service_hours}
              onChange={handleFormChange}
              placeholder="e.g. 05:30-00:00"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] px-5 py-3 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding Route...' : 'Add Route'}
          </button>
        </form>
      </div>

      {/* existing routes list */}
      <div className="rounded-xl bg-white shadow-sm p-5 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Existing Routes</h2>

        {loading && (
          <p className="text-sm text-gray-500">Loading routes...</p>
        )}

        {!loading && routes.length === 0 && (
          <p className="text-gray-400 text-center py-8">No routes yet. Add one above.</p>
        )}

        <div className="space-y-3">
          {routes.map((route) => {
            const isExpanded = expandedRouteId === route.RouteID;
            const stops = stopsByRoute[route.RouteID] || [];

            return (
              <div
                key={route.RouteID}
                className="rounded-xl bg-white shadow-sm p-4 mb-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {route.route_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {route.service_hours || 'No service hours set'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleToggleExpand(route.RouteID)}
                      className="rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExpanded ? 'Hide Stops' : 'Manage Stops'}
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(route.RouteID)}
                      className="rounded-full bg-red-500 text-white hover:bg-red-600 px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Stops on This Route
                    </p>

                    {stops.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No stops linked to this route yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {stops.map((stop) => (
                          <li
                            key={`${stop.StationID}-${stop.TransitID}`}
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                          >
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">
                                {stop.station_name}
                              </span>
                              <span className="text-gray-500">
                                {' '}({stop.station_code}) via {stop.route_label} ({stop.vehicle_type})
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                handleRemoveStop(route.RouteID, stop.StationID, stop.TransitID)
                              }
                              className="text-red-400 hover:text-red-600 cursor-pointer transition-colors text-sm"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form
                      onSubmit={(e) => handleAddStop(e, route.RouteID)}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
                          Station
                        </label>
                        <select
                          name="StationID"
                          value={stopForm.StationID}
                          onChange={handleStopFormChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
                        >
                          <option value="">Pick a station</option>
                          {stations.map((s) => (
                            <option key={s.PlaceID} value={s.PlaceID}>
                              {s.name} ({s.station_code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
                          Transit Vehicle
                        </label>
                        <select
                          name="TransitID"
                          value={stopForm.TransitID}
                          onChange={handleStopFormChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
                        >
                          <option value="">Pick a vehicle</option>
                          {vehicles.map((v) => (
                            <option key={v.TransitID} value={v.TransitID}>
                              {v.route_label} ({v.vehicle_type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] px-5 py-3 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Stop
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
