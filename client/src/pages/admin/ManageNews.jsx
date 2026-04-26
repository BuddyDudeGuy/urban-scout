/*
 * manage news page - lets admins create news posts with optional safety alerts
 * uses dropdowns for severity and alert type (minimal keyboard input)
 */
import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { capitalize } from '../../utils/placeFormat';

export default function ManageNews() {
  const { admin } = useAuth();
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('low');
  const [bodyText, setBodyText] = useState('');
  const [addAlert, setAddAlert] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [areaText, setAreaText] = useState('');
  const [message, setMessage] = useState('');

  const loadNews = async () => {
    const res = await api.get('/api/news', {
      params: { regionId: admin.RegionID },
    });
    setNews(res.data);
  };

  useEffect(() => { if (admin) loadNews(); }, [admin]);

  /*
   * create a new news post, optionally with a safety alert
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        severity,
        body_text: bodyText,
        regionId: admin.RegionID,
      };

      if (addAlert && alertType) {
        payload.alert = {
          alert_type: alertType,
          area_text: areaText,
          severity_override: severity === 'high' ? 'high' : null,
        };
      }

      await api.post('/api/news', payload);
      setMessage('News post created!');
      setTitle('');
      setSeverity('low');
      setBodyText('');
      setAddAlert(false);
      setAlertType('');
      setAreaText('');
      setShowForm(false);
      loadNews();
    } catch (err) {
      setMessage('Failed to create post');
    }
  };

  const alertTypes = ['road_closure', 'crowd', 'weather', 'construction', 'protest', 'other'];
  const severities = ['low', 'medium', 'high'];

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">
      <PageHeader
        title="Manage News"
        subtitle="Publish news posts and safety alerts"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showForm ? 'Cancel' : '+ New Post'}
          </button>
        }
      />

      {message && (
        <p className={`text-sm mb-3 ${message.includes('created') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      {/* create news post form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl bg-white shadow-sm p-5 mb-4">
          <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Title</label>
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-3"
            required
          />

          {/* severity selector buttons */}
          <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Severity</label>
          <div className="flex gap-2 mb-3">
            {severities.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                  severity === s
                    ? 'bg-[#1E3A5F] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {capitalize(s)}
              </button>
            ))}
          </div>

          <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Body</label>
          <textarea
            placeholder="Post body"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-3"
            rows={3}
            required
          />

          {/* toggle to add a safety alert */}
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={addAlert}
              onChange={(e) => setAddAlert(e.target.checked)}
              className="cursor-pointer"
            />
            <span className="text-sm text-gray-700">Include Safety Alert (optional)</span>
          </label>

          {addAlert && (
            <div className="bg-red-50 p-3 rounded-lg mb-3">
              <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Alert Type</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-2 cursor-pointer"
                required
              >
                <option value="">Alert type...</option>
                {alertTypes.map(t => (
                  <option key={t} value={t}>{t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                ))}
              </select>
              <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Affected Area</label>
              <input
                type="text"
                placeholder="Affected area"
                value={areaText}
                onChange={(e) => setAreaText(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] px-5 py-3 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publish
          </button>
        </form>
      )}

      {/* existing news posts */}
      {news.map(post => (
        <div key={`${post.NewsID}-${post.AlertNo || 0}`} className={`rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-5 mb-4 ${post.alert_type ? 'border-l-4 border-red-400' : ''}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900">{post.title}</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              post.severity === 'high' ? 'bg-red-100 text-red-700' :
              post.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {capitalize(post.severity)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{post.body_text}</p>
          {post.alert_type && (
            <div className="bg-red-50 p-3 rounded-lg mb-3">
              <p className="text-sm font-semibold text-red-700">
                {post.alert_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </p>
              {post.area_text && <p className="text-sm text-red-600 mt-1">{post.area_text}</p>}
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-500">
            <span>{new Date(post.time_stamp).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
