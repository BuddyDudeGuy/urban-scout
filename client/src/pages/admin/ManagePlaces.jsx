import { useEffect, useState } from 'react';
import api from '../../api';

export default function ManagePlaces() {
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    address: '',
    coordinates: '',
    RegionID: '',
    type: 'landmark',
    landmark_type: '',
    hours: '',
    avg_cost_per_person: '',
    station_code: '',
  });

  useEffect(() => {
    fetchRegions();
  }, []);

  async function fetchRegions() {
    try {
      setLoadingRegions(true);
      const res = await api.get('/api/regions');
      console.log('regions response:', res.data);
      setRegions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load regions.');
    } finally {
      setLoadingRegions(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'type') {
        updated.landmark_type = '';
        updated.hours = '';
        updated.avg_cost_per_person = '';
        updated.station_code = '';
      }

      return updated;
    });
  }

  function validateForm() {
    if (!form.name.trim()) return 'Place name is required.';
    if (!form.address.trim()) return 'Address is required.';
    if (!form.coordinates.trim()) return 'Coordinates are required.';
    if (!form.RegionID) return 'Please select a region.';
    if (!form.type) return 'Please select a place type.';

    if (form.type === 'landmark') {
      if (!form.landmark_type.trim()) return 'Landmark type is required.';
      if (!form.hours.trim()) return 'Hours are required for landmarks.';
    }

    if (form.type === 'eatery') {
      if (!form.avg_cost_per_person) return 'Average cost is required for eateries.';
      if (Number(form.avg_cost_per_person) < 0) return 'Average cost must be non-negative.';
    }

    if (form.type === 'transit_station') {
      if (!form.station_code.trim()) return 'Station code is required for transit stations.';
    }

    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        coordinates: form.coordinates.trim(),
        RegionID: Number(form.RegionID),
        type: form.type,
        landmark_type: form.landmark_type.trim(),
        hours: form.hours.trim(),
        avg_cost_per_person:
          form.avg_cost_per_person === '' ? null : Number(form.avg_cost_per_person),
        station_code: form.station_code.trim(),
      };

      await api.post('/api/places', payload);

      setMessage('Place added successfully.');
      setForm({
        name: '',
        address: '',
        coordinates: '',
        RegionID: '',
        type: 'landmark',
        landmark_type: '',
        hours: '',
        avg_cost_per_person: '',
        station_code: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add place.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 pb-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Manage Places</h1>
          <p className="mt-1 text-sm text-slate-600">
            Add a new landmark, eatery, or transit station to the system.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Place Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Bukchon Hanok Village"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street address"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Coordinates
              </label>
              <input
                type="text"
                name="coordinates"
                value={form.coordinates}
                onChange={handleChange}
                placeholder="e.g. 37.5826,126.9830"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Region
              </label>
              <select
                name="RegionID"
                value={form.RegionID}
                onChange={handleChange}
                disabled={loadingRegions}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingRegions ? 'Loading regions...' : 'Select a region'}
                </option>
                {Array.isArray(regions) && regions.map((region) => (
                  <option key={region.RegionID} value={region.RegionID}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Place Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              >
                <option value="landmark">Landmark</option>
                <option value="eatery">Eatery</option>
                <option value="transit_station">Transit Station</option>
              </select>
            </div>

            {form.type === 'landmark' && (
              <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-slate-800">
                  Landmark Details
                </h2>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Landmark Type
                  </label>
                  <input
                    type="text"
                    name="landmark_type"
                    value={form.landmark_type}
                    onChange={handleChange}
                    placeholder="e.g. Palace, Museum, Observation"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Hours
                  </label>
                  <input
                    type="text"
                    name="hours"
                    value={form.hours}
                    onChange={handleChange}
                    placeholder="e.g. 09:00-18:00"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                  />
                </div>
              </div>
            )}

            {form.type === 'eatery' && (
              <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-slate-800">
                  Eatery Details
                </h2>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Average Cost Per Person
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="avg_cost_per_person"
                    value={form.avg_cost_per_person}
                    onChange={handleChange}
                    placeholder="e.g. 18.50"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                  />
                </div>
              </div>
            )}

            {form.type === 'transit_station' && (
              <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-slate-800">
                  Transit Station Details
                </h2>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Station Code
                  </label>
                  <input
                    type="text"
                    name="station_code"
                    value={form.station_code}
                    onChange={handleChange}
                    placeholder="e.g. BKV"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-slate-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Adding Place...' : 'Add Place'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}