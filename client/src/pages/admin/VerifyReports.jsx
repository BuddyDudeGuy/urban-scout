/*
 * verify reports page - lets admins confirm or reject incident reports
 * all interactions are button clicks (confirm/reject), no typing needed
 */
import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { capitalize } from '../../utils/placeFormat';

export default function VerifyReports() {
  const { admin } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState('all');

  const loadIncidents = async () => {
    const res = await api.get('/api/incidents', {
      params: { regionId: admin.RegionID },
    });
    setIncidents(res.data);
  };

  useEffect(() => { if (admin) loadIncidents(); }, [admin]);

  /*
   * confirm or reject a report - calls the verify endpoint
   */
  const handleVerify = async (reportId, status) => {
    await api.put(`/api/incidents/${reportId}/verify`, { status });
    loadIncidents();
  };

  /*
   * filter incidents based on the selected status tab
   */
  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !incident.verification_status || incident.verification_status === 'pending';
    if (filter === 'confirmed') return incident.verification_status === 'confirmed';
    if (filter === 'rejected') return incident.verification_status === 'rejected';
    return true;
  });

  const filters = ['all', 'pending', 'confirmed', 'rejected'];

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">
      <PageHeader
        title="Verify Reports"
        subtitle="Review and verify pending incident reports"
      />

      {/* filter buttons to narrow down by verification status */}
      <div className="flex gap-2 mb-4">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
              filter === f
                ? 'bg-[#1E3A5F] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredIncidents.length === 0 && (
        <p className="text-gray-400 text-center py-8">No reports for your region</p>
      )}

      {filteredIncidents.map(incident => (
        <div key={incident.Report_ID} className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-bold text-gray-900">{incident.category?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                incident.severity === 'high' ? 'bg-red-100 text-red-700' :
                incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {capitalize(incident.severity)}
              </span>
            </div>
            {/* current verification status */}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              incident.verification_status === 'confirmed' ? 'bg-green-100 text-green-700' :
              incident.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {capitalize(incident.verification_status) || 'Unreviewed'}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-1">{incident.description}</p>
          <p className="text-xs text-gray-500 mb-3">
            Reported by {incident.reporter_name} on {new Date(incident.timestamp).toLocaleDateString()}
          </p>

          {/* show big confirm/reject buttons only for pending reports, otherwise just a tiny link to flip the status */}
          {(!incident.verification_status || incident.verification_status === 'pending') ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleVerify(incident.Report_ID, 'confirmed')}
                className="flex-1 rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
              <button
                onClick={() => handleVerify(incident.Report_ID, 'rejected')}
                className="flex-1 rounded-full bg-red-500 text-white hover:bg-red-600 px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors"
              >
                Reject
              </button>
            </div>
          ) : incident.verification_status === 'confirmed' ? (
            <div className="flex justify-end">
              <button
                onClick={() => handleVerify(incident.Report_ID, 'rejected')}
                className="text-red-400 hover:text-red-600 cursor-pointer transition-colors text-sm"
              >
                Mark as rejected
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => handleVerify(incident.Report_ID, 'confirmed')}
                className="text-sm text-gray-500 hover:text-[#1E3A5F] cursor-pointer transition-colors"
              >
                Mark as confirmed
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
