/*
 * verify reports page - lets admins confirm or reject incident reports
 * all interactions are button clicks (confirm/reject), no typing needed
 */
import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

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
    <div className="pb-20 p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Verify Reports</h1>

      {/* filter buttons to narrow down by verification status */}
      <div className="flex gap-2 mb-4">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
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
        <div key={incident.Report_ID} className="bg-white rounded-lg shadow p-4 mb-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-bold">{incident.category?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
              <span className={`ml-2 text-xs px-2 py-1 rounded ${
                incident.severity === 'high' ? 'bg-red-100 text-red-700' :
                incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {incident.severity}
              </span>
            </div>
            {/* current verification status */}
            <span className={`text-xs px-2 py-1 rounded ${
              incident.verification_status === 'confirmed' ? 'bg-green-100 text-green-700' :
              incident.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {incident.verification_status || 'unreviewed'}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-1">{incident.description}</p>
          <p className="text-xs text-gray-400 mb-3">
            Reported by {incident.reporter_name} on {new Date(incident.timestamp).toLocaleDateString()}
          </p>

          {/* confirm and reject buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleVerify(incident.Report_ID, 'confirmed')}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-green-600 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => handleVerify(incident.Report_ID, 'rejected')}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
