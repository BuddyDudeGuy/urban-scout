/*
 * incident report page - lets users submit reports about issues they see
 * uses dropdowns for category and severity (minimal keyboard input)
 * only the description field needs actual typing
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function IncidentPage() {
  const { user } = useAuth();
  const [regions, setRegions] = useState([]);
  const [regionId, setRegionId] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/subscriptions').then(res => setRegions(res.data));
  }, []);

  /*
   * submit the incident report to the backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/incidents', {
        category,
        severity,
        description,
        regionId,
        coordinates: '',
      });
      setMessage('Report submitted successfully!');
      setCategory('');
      setSeverity('');
      setDescription('');
      setRegionId('');
    } catch (err) {
      setMessage('Failed to submit report');
    }
  };

  /*
   * clear the success message and reset form so user can file another report
   */
  const handleReportAnother = () => {
    setMessage('');
    setCategory('');
    setSeverity('');
    setDescription('');
    setRegionId('');
  };

  /*
   * predefined categories and severities so users just pick from a list
   */
  const categories = ['theft', 'road_hazard', 'crowd', 'safety', 'noise', 'other'];
  const severities = ['low', 'medium', 'high'];

  /*
   * maps severity to active pill colors
   */
  const severityActiveColor = {
    low: 'bg-green-500 text-white',
    medium: 'bg-yellow-500 text-white',
    high: 'bg-red-500 text-white',
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* clean header - no hero image, just title and description */}
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Report an Incident</h1>
        <p className="text-gray-500">
          Report safety issues, hazards, or incidents. Admins will review and verify your report.
        </p>
      </div>

      {/* main content */}
      <div className="max-w-lg mx-auto px-4 pb-24 pt-6">

        {/* show persistent success card when report is submitted, hide the form */}
        {message && message.includes('success') ? (
          <div className="rounded-xl bg-green-50 border border-green-200 shadow-sm p-6 text-center">
            <div className="text-3xl mb-3">&#10003;</div>
            <p className="text-green-700 font-semibold text-lg mb-1">Report Submitted</p>
            <p className="text-green-600 text-sm mb-5">
              Thank you! Your report has been received and will be reviewed by an admin.
            </p>
            <button
              onClick={handleReportAnother}
              className="rounded-full bg-[#1E3A5F] hover:bg-[#2d5a8e] text-white cursor-pointer px-6 py-3 font-medium transition-colors"
            >
              Report Another
            </button>
            <div className="mt-4">
              <Link to="/incidents/mine" className="text-[#1E3A5F] hover:underline cursor-pointer text-sm">View My Reports →</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl bg-white shadow-sm p-6">

            {/* region dropdown */}
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg mb-4 bg-white cursor-pointer text-gray-700"
              required
            >
              <option value="">Select region...</option>
              {regions.map(r => (
                <option key={r.RegionID} value={r.RegionID}>{r.name}</option>
              ))}
            </select>

            {/* category dropdown with formatted labels */}
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg mb-4 bg-white cursor-pointer text-gray-700"
              required
            >
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>

            {/* severity pill buttons */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <div className="flex gap-3 mb-4">
              {severities.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`flex-1 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                    severity === s
                      ? severityActiveColor[s]
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* description - the only field that actually needs typing */}
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg mb-5 text-gray-700"
              rows={3}
              placeholder="What happened?"
              required
            />

            {/* submit button */}
            <button
              type="submit"
              className="rounded-full bg-[#1E3A5F] hover:bg-[#2d5a8e] text-white cursor-pointer w-full py-3 font-medium transition-colors"
            >
              Submit Report
            </button>

            {/* show error message inline if submission failed */}
            {message && !message.includes('success') && (
              <p className="text-sm mt-3 text-center text-red-500">
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
