/*
 * manage news page - lets admins create news posts with optional safety alerts
 * uses dropdowns for severity and alert type (minimal keyboard input)
 */
import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

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
    <div className="pb-20 p-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Manage News</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-blue-600 transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Post'}
        </button>
      </div>

      {message && (
        <p className={`text-sm mb-3 ${message.includes('created') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      {/* create news post form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-4">
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg mb-3"
            required
          />

          {/* severity selector buttons */}
          <label className="block text-sm font-medium text-gray-600 mb-1">Severity</label>
          <div className="flex gap-2 mb-3">
            {severities.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={`flex-1 py-2 rounded-lg text-sm cursor-pointer ${
                  severity === s
                    ? s === 'low' ? 'bg-green-500 text-white'
                    : s === 'medium' ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Post body"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            className="w-full p-2 border rounded-lg mb-3"
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
            <span className="text-sm">Include Safety Alert (optional)</span>
          </label>

          {addAlert && (
            <div className="bg-red-50 p-3 rounded-lg mb-3">
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full p-2 border rounded-lg mb-2 bg-white cursor-pointer"
                required
              >
                <option value="">Alert type...</option>
                {alertTypes.map(t => (
                  <option key={t} value={t}>{t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Affected area"
                value={areaText}
                onChange={(e) => setAreaText(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          )}

          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg cursor-pointer hover:bg-green-600 transition-colors">
            Publish
          </button>
        </form>
      )}

      {/* existing news posts */}
      {news.map(post => (
        <div key={`${post.NewsID}-${post.AlertNo || 0}`} className="bg-white rounded-lg shadow p-4 mb-3">
          <div className="flex justify-between items-start">
            <h3 className="font-bold">{post.title}</h3>
            <span className={`text-xs px-2 py-1 rounded ${
              post.severity === 'high' ? 'bg-red-100 text-red-700' :
              post.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {post.severity}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{post.body_text}</p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(post.time_stamp).toLocaleDateString()}
          </p>
          {post.alert_type && (
            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
              <p className="text-xs font-bold text-red-600">Alert: {post.alert_type}</p>
              <p className="text-xs text-red-500">{post.area_text}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
