/*
 * news feed page - shows news posts for the user's subscribed regions
 * split into two sections: safety alerts (urgent) on top, general news below
 * clean text header with region filter pills
 */
import { useState, useEffect } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import { capitalize } from '../utils/placeFormat';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [regions, setRegions] = useState([]);
  const [regionId, setRegionId] = useState('');

  useEffect(() => {
    api.get('/api/subscriptions').then(res => setRegions(res.data));
  }, []);

  /*
   * fetch news whenever the region filter changes
   */
  useEffect(() => {
    const params = regionId ? { regionId } : {};
    api.get('/api/news', { params }).then(res => setNews(res.data));
  }, [regionId]);

  /*
   * track that the user viewed this post (fires once per click)
   */
  const handleView = async (newsId) => {
    await api.post(`/api/news/${newsId}/view`).catch(() => {});
  };

  /*
   * split the flat API response into alerts vs regular news
   */
  const alerts = news.filter(post => post.alert_type);
  const newsPosts = news.filter(post => !post.alert_type);

  /*
   * color based on severity for the pill badges
   */
  const severityColor = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  /*
   * format "road_closure" → "Road Closure"
   */
  const formatLabel = (str) =>
    str ? str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">
      <PageHeader
        title="News & Safety Alerts"
        subtitle="Stay informed about events and safety in your subscribed regions"
      />

        {/* region filter as horizontal scrollable pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
          <button
            onClick={() => setRegionId('')}
            className={
              regionId === ''
                ? 'rounded-full bg-[#1E3A5F] text-white px-4 py-2 text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap'
                : 'rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap'
            }
          >
            All Regions
          </button>
          {regions.map(r => (
            <button
              key={r.RegionID}
              onClick={() => setRegionId(String(r.RegionID))}
              className={
                regionId === String(r.RegionID)
                  ? 'rounded-full bg-[#1E3A5F] text-white px-4 py-2 text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap'
                  : 'rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap'
              }
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* empty state when there's nothing to show */}
        {news.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            No news here yet. Try selecting another region, or check back later for updates.
          </p>
        )}

        {/* safety alerts section */}
        {alerts.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Safety Alerts</h2>
            </div>

            {alerts.map(post => (
              <div
                key={`${post.NewsID}-${post.AlertNo || 0}`}
                className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 mb-4 border-l-4 border-red-400"
                onClick={() => handleView(post.NewsID)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{post.title}</h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      severityColor[post.severity_override || post.severity] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {capitalize(post.severity_override || post.severity)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {post.body_text}
                </p>

                {/* alert detail box */}
                <div className="bg-red-50 p-3 rounded-lg mb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span className="text-sm font-semibold text-red-700">{formatLabel(post.alert_type)}</span>
                  </div>
                  {post.area_text && (
                    <div className="flex items-start gap-1.5 text-sm text-red-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-red-400">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{post.area_text}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{post.region_name}</span>
                  <span>{new Date(post.time_stamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* news section */}
        {newsPosts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1E3A5F]">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <line x1="10" y1="6" x2="18" y2="6" />
                <line x1="10" y1="10" x2="18" y2="10" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">News</h2>
            </div>

            {newsPosts.map(post => (
              <div
                key={`${post.NewsID}-${post.AlertNo || 0}`}
                className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 mb-4"
                onClick={() => handleView(post.NewsID)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{post.title}</h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      severityColor[post.severity] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {capitalize(post.severity)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {post.body_text}
                </p>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{post.region_name}</span>
                  <span>{new Date(post.time_stamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </section>
        )}
    </div>
  );
}
