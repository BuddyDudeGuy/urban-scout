/*
 * incident report page - two column layout
 * left side shows all of the user's previously submitted reports with status
 * right side is the submit form. on mobile the form stacks on top since that's
 * what people tap the Report tab for, and the history sits below
 */
import { useState, useEffect } from 'react';
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
  const [myReports, setMyReports] = useState([]);

  /*
   * pull the user's subscribed regions (for the form dropdown) and
   * the list of reports they've already submitted (for the left column)
   */
  const loadMine = async () => {
    const res = await api.get('/api/incidents/mine');
    setMyReports(res.data);
  };

  useEffect(() => {
    api.get('/api/subscriptions').then(res => setRegions(res.data));
    loadMine();
  }, []);

  /*
   * submit the incident report to the backend
   * on success: show a small inline banner, reset the form, and
   * refresh the left-side list so the new report pops in at the top
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
      loadMine();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to submit report');
    }
  };

  /*
   * predefined categories and severities so users just pick from a list
   */
  const categories = ['theft', 'road_hazard', 'crowd', 'safety', 'noise', 'other'];
  const severities = ['low', 'medium', 'high'];

  /*
   * maps severity to active pill colors on the form
   */
  const severityActiveColor = {
    low: 'bg-green-500 text-white',
    medium: 'bg-yellow-500 text-white',
    high: 'bg-red-500 text-white',
  };

  /*
   * colors for the verification status badge on each past report card
   */
  const statusStyle = {
    confirmed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* page header */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Report an Incident</h1>
        <p className="text-gray-500">
          Report safety issues, hazards, or incidents. Admins will review and verify your report.
        </p>
      </div>

      {/* two column grid - reports on the left, form on the right */}
      {/* on mobile the form jumps to the top because that's the primary tap target */}
      <div className="max-w-6xl mx-auto px-4 pb-24 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* left column - user's past reports */}
          <section className="order-2 lg:order-1">
            <h2 className="text-lg font-bold text-gray-900 mb-3">My Reports</h2>

            {myReports.length === 0 && (
              <div className="rounded-xl bg-white shadow-sm p-6 text-center text-gray-400">
                <p className="text-sm">No reports submitted yet</p>
                <p className="text-xs mt-1">Anything you submit on the right will show up here</p>
              </div>
            )}

            {/* scrollable list so the left column stays put even with lots of reports */}
            <div className="space-y-3 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
              {myReports.map(report => (
                <div key={report.Report_ID} className="rounded-xl bg-white shadow-sm p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {report.category?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        report.severity === 'high' ? 'bg-red-100 text-red-700' :
                        report.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {report.severity}
                      </span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      statusStyle[report.verification_status] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {report.verification_status || 'Pending Review'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{report.region_name}</span>
                    <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                  </div>
                  {report.verifier_name && (
                    <p className="text-xs text-gray-400 mt-1">Reviewed by: {report.verifier_name}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* right column - the submit form */}
          <section className="order-1 lg:order-2">
            <h2 className="text-lg font-bold text-gray-900 mb-3">New Report</h2>
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

              {/* inline banner for success or failure - auto-clears after a few seconds on success */}
              {message && (
                <p className={`text-sm mt-3 text-center ${
                  message.includes('success') ? 'text-green-600' : 'text-red-500'
                }`}>
                  {message}
                </p>
              )}
            </form>
          </section>

        </div>
      </div>
    </div>
  );
}
