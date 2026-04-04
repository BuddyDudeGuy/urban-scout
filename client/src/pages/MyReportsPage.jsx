/* my reports page - shows the user all the incident reports they've submitted
   and whether an admin has confirmed or rejected them */
import { useState, useEffect } from 'react';
import api from '../api';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get('/api/incidents/mine').then(res => setReports(res.data));
  }, []);

  /* color for verification status badge */
  const statusStyle = {
    confirmed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">My Reports</h1>
      <p className="text-gray-500 mb-6">Track the status of incidents you've reported</p>

      {reports.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-1">No reports submitted yet</p>
          <p className="text-sm">When you report an incident, it will appear here with its verification status</p>
        </div>
      )}

      {reports.map(report => (
        <div key={report.Report_ID} className="rounded-xl bg-white shadow-sm p-5 mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-semibold text-gray-900">
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
  );
}
