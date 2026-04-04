/*
 * admin dashboard - shows overview stats for the admin's assigned region
 * quick summary of reports, news posts, and places
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const [stats, setStats] = useState({ incidents: [], news: [], region: null });

  /*
   * load the admin's region info and pending incidents
   */
  useEffect(() => {
    if (!admin) return;
    Promise.all([
      api.get('/api/incidents', { params: { regionId: admin.RegionID } }),
      api.get('/api/news', { params: { regionId: admin.RegionID } }),
      api.get(`/api/regions/${admin.RegionID}`),
    ]).then(([incRes, newsRes, regRes]) => {
      setStats({
        incidents: incRes.data,
        news: newsRes.data,
        region: regRes.data,
      });
    });
  }, [admin]);

  /*
   * count how many reports are still pending
   */
  const pendingCount = stats.incidents.filter(
    i => !i.verification_status || i.verification_status === 'pending'
  ).length;

  return (
    <div className="pb-20 p-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">
            {admin?.name} — {stats.region?.name || 'Loading...'}
          </p>
        </div>
        <button onClick={logout} className="text-sm text-red-500 font-medium cursor-pointer hover:text-red-700 transition-colors">
          Logout
        </button>
      </div>

      {/* stat cards - pending reports and news posts are clickable links */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/admin/reports" className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:shadow-lg transition-all">
          <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
          <p className="text-xs text-gray-500">Pending Reports</p>
        </Link>
        <Link to="/admin/news" className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:shadow-lg transition-all">
          <p className="text-2xl font-bold text-blue-500">{stats.news.length}</p>
          <p className="text-xs text-gray-500">News Posts</p>
        </Link>
        <div className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:shadow-lg transition-all">
          <p className="text-2xl font-bold text-green-500">{stats.region?.placeCount || 0}</p>
          <p className="text-xs text-gray-500">Places</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:shadow-lg transition-all">
          <p className="text-2xl font-bold text-purple-500">{stats.incidents.length}</p>
          <p className="text-xs text-gray-500">Total Reports</p>
        </div>
      </div>

      {/* recent pending reports preview */}
      <h2 className="font-bold mb-2">Recent Pending Reports</h2>
      {stats.incidents
        .filter(i => !i.verification_status || i.verification_status === 'pending')
        .slice(0, 3)
        .map(incident => (
          <div key={incident.Report_ID} className="bg-white rounded-lg shadow p-3 mb-2 hover:shadow-md transition-shadow">
            <div className="flex justify-between">
              <span className="font-medium text-sm">{incident.category}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                incident.severity === 'high' ? 'bg-red-100 text-red-700' :
                incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {incident.severity}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{incident.description?.slice(0, 80)}</p>
          </div>
        ))
      }
      {pendingCount === 0 && (
        <p className="text-gray-400 text-sm">No pending reports</p>
      )}
    </div>
  );
}
