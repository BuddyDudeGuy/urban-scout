/*
 * admin dashboard - shows overview stats for the admin's assigned region
 * quick summary of reports, news posts, and places
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';

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
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">
      <PageHeader
        title="Admin Dashboard"
        subtitle={`${admin?.name || ''} — ${stats.region?.name || 'Loading...'}`}
        action={
          <button
            onClick={logout}
            className="rounded-full bg-red-500 text-white hover:bg-red-600 px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors"
          >
            Logout
          </button>
        }
      />

      {/* stat cards - pending reports, news posts, places, and routes are clickable links */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/admin/reports" className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 text-center cursor-pointer">
          <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
          <p className="text-xs text-gray-500">Pending Reports</p>
        </Link>
        <Link to="/admin/news" className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 text-center cursor-pointer">
          <p className="text-2xl font-bold text-[#1E3A5F]">{stats.news.length}</p>
          <p className="text-xs text-gray-500">News Posts</p>
        </Link>
        <Link to="/admin/places" className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 text-center cursor-pointer">
          <p className="text-2xl font-bold text-green-500">{stats.region?.placeCount || 0}</p>
          <p className="text-xs text-gray-500">Places</p>
        </Link>
        <Link to="/admin/routes" className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 text-center cursor-pointer">
          <p className="text-2xl font-bold text-[#1E3A5F]">Routes</p>
          <p className="text-xs text-gray-500">Manage Transit</p>
        </Link>
        <div className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 text-center cursor-pointer col-span-2">
          <p className="text-2xl font-bold text-[#1E3A5F]">{stats.incidents.length}</p>
          <p className="text-xs text-gray-500">Total Reports</p>
        </div>
      </div>

      {/* recent pending reports preview */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Pending Reports</h2>
      {stats.incidents
        .filter(i => !i.verification_status || i.verification_status === 'pending')
        .slice(0, 3)
        .map(incident => (
          <div key={incident.Report_ID} className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 mb-4">
            <div className="flex justify-between">
              <span className="font-medium text-sm text-gray-900">{incident.category}</span>
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
        <p className="text-gray-400 text-center py-8">No pending reports</p>
      )}
    </div>
  );
}
