/*
 * incident report page - two column layout
 * left side shows all of the user's previously submitted reports with status
 * right side is the submit form. on mobile the form stacks on top since that's
 * what people tap the Report tab for, and the history sits below
 */
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { capitalize } from '../utils/placeFormat';

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
    <div className="max-w-6xl mx-auto px-4 md:px-8 pb-24 pt-8">

      <PageHeader
        title="Report an Incident"
        subtitle="Report safety issues, hazards, or incidents. Admins will review and verify your report."
      />

      {/* two-column on desktop: reports list on the left, form on the right
          on mobile they stack with the form first (primary tap target) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* form column - on desktop sits on the right, on mobile shows first */}
      <section className="lg:col-start-2 lg:row-start-1">
        <h2 className="text-lg font-bold text-gray-900 mb-3">New Report</h2>
        <form onSubmit={handleSubmit} className="rounded-xl bg-white shadow-sm p-5 mb-4">

          {/* region dropdown */}
          <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Region</label>
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-4"
            required
          >
            <option value="">Select region...</option>
            {regions.map(r => (
              <option key={r.RegionID} value={r.RegionID}>{r.name}</option>
            ))}
          </select>

          {/* category dropdown with formatted labels */}
          <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-4"
            required
          >
            <option value="">Select category...</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>

          {/* severity pill buttons - active state keeps semantic red/yellow/green to communicate level */}
          <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Severity</label>
          <div className="flex gap-3 mb-4">
            {severities.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={
                  severity === s
                    ? `flex-1 rounded-full ${severityActiveColor[s]} px-4 py-2 text-sm font-semibold cursor-pointer transition-colors`
                    : 'flex-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 text-sm font-semibold cursor-pointer transition-colors'
                }
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* description - the only field that actually needs typing */}
          <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-5"
            rows={3}
            placeholder="What happened?"
            required
          />

          {/* submit button */}
          <button
            type="submit"
            className="rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] px-5 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full py-3"
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

      {/* reports column - on desktop sits on the left, on mobile shows below the form */}
      <section className="lg:col-start-1 lg:row-start-1">
        <h2 className="text-lg font-bold text-gray-900 mb-3">My Reports</h2>

        {myReports.length === 0 && (
          <p className="text-gray-400 text-center py-8">No reports submitted yet. Anything you submit above will show up here.</p>
        )}

        {myReports.map(report => (
          <div key={report.Report_ID} className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 mb-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {report.category?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  report.severity === 'high' ? 'bg-red-100 text-red-700' :
                  report.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {capitalize(report.severity)}
                </span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                statusStyle[report.verification_status] || 'bg-gray-100 text-gray-600'
              }`}>
                {capitalize(report.verification_status) || 'Pending Review'}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {/* description */}
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-[#1E3A5F]">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>{report.description}</span>
              </div>

              {/* location */}
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-[#1E3A5F]">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{report.region_name}</span>
              </div>

              {/* date */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#1E3A5F]">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{new Date(report.timestamp).toLocaleDateString()}</span>
              </div>
            </div>

            {report.verifier_name && (
              <p className="text-xs text-gray-500">Reviewed by: {report.verifier_name}</p>
            )}
          </div>
        ))}
      </section>

      </div>
    </div>
  );
}
