/*
 * manage places page - lets admins add a new landmark, eatery, or transit station
 * type-specific fields appear based on the selected place type
 */
import { useEffect, useState } from 'react';
import api from '../../api';
import PageHeader from '../../components/PageHeader';

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

  /*
   * load the list of regions for the region dropdown
   */
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

  /*
   * generic field change handler - resets type-specific fields when type flips
   */
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

  /*
   * client-side validation before we hit the server
   */
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

  /*
   * submit the new place to the server, then reset the form on success
   */
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
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">
      <PageHeader
        title="Manage Places"
        subtitle="Add a new landmark, eatery, or transit station to the system."
      />

      <div className="rounded-xl bg-white shadow-sm p-5 mb-4">
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
            <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
              Place Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Bukchon Hanok Village"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street address"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
              Coordinates
            </label>
            <input
              type="text"
              name="coordinates"
              value={form.coordinates}
              onChange={handleChange}
              placeholder="e.g. 37.5826,126.9830"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
              Region
            </label>
            <select
              name="RegionID"
              value={form.RegionID}
              onChange={handleChange}
              disabled={loadingRegions}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors disabled:opacity-50"
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
            <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
              Place Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
            >
              <option value="landmark">Landmark</option>
              <option value="eatery">Eatery</option>
              <option value="transit_station">Transit Station</option>
            </select>
          </div>

          {form.type === 'landmark' && (
            <div className="space-y-4 rounded-xl bg-white shadow-sm p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Landmark Details
              </h2>

              <div>
                <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
                  Landmark Type
                </label>
                <input
                  type="text"
                  name="landmark_type"
                  value={form.landmark_type}
                  onChange={handleChange}
                  placeholder="e.g. Palace, Museum, Observation"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
                  Hours
                </label>
                <input
                  type="text"
                  name="hours"
                  value={form.hours}
                  onChange={handleChange}
                  placeholder="e.g. 09:00-18:00"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
                />
              </div>
            </div>
          )}

          {form.type === 'eatery' && (
            <div className="space-y-4 rounded-xl bg-white shadow-sm p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Eatery Details
              </h2>

              <div>
                <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
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
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
                />
              </div>
            </div>
          )}

          {form.type === 'transit_station' && (
            <div className="space-y-4 rounded-xl bg-white shadow-sm p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Transit Station Details
              </h2>

              <div>
                <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">
                  Station Code
                </label>
                <input
                  type="text"
                  name="station_code"
                  value={form.station_code}
                  onChange={handleChange}
                  placeholder="e.g. BKV"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white uppercase transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] px-5 py-3 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding Place...' : 'Add Place'}
          </button>
        </form>
      </div>
    </div>
  );
}
