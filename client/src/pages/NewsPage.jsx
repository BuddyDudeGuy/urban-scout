/*
 * news feed page - shows news posts for the user's subscribed regions
 * also shows safety alerts if a post has one attached
 * clean text header with region filter pills
 */
import { useState, useEffect } from 'react';
import api from '../api';

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
   * color based on severity for the pill badges
   */
  const severityColor = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">News & Safety Alerts</h1>
      <p className="text-gray-500 mb-6">Stay informed about events and safety in your subscribed regions</p>

        {/* region filter as horizontal scrollable pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
          <button
            onClick={() => setRegionId('')}
            className={`cursor-pointer rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors ${
              regionId === ''
                ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            All Regions
          </button>
          {regions.map(r => (
            <button
              key={r.RegionID}
              onClick={() => setRegionId(String(r.RegionID))}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                regionId === String(r.RegionID)
                  ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* empty state when there's nothing to show */}
        {news.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-1">No news here yet</p>
            <p className="text-gray-300 text-sm">
              Try selecting another region, or check back later for updates.
            </p>
          </div>
        )}

        {/* news cards */}
        {news.map(post => (
          <div
            key={`${post.NewsID}-${post.AlertNo || 0}`}
            className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 mb-4"
            onClick={() => handleView(post.NewsID)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900">{post.title}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  severityColor[post.severity] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {post.severity}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {post.body_text}
            </p>

            <div className="flex justify-between text-xs text-gray-400">
              <span>{post.region_name}</span>
              <span>{new Date(post.time_stamp).toLocaleDateString()}</span>
            </div>

            {/* safety alert section inside the card */}
            {post.alert_type && (
              <div className="border-l-4 border-red-400 bg-red-50 p-3 rounded-r-lg mt-3">
                <p className="text-sm font-semibold text-red-600">
                  Safety Alert: {post.alert_type}
                </p>
                <p className="text-sm text-red-500 mt-1">{post.area_text}</p>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
