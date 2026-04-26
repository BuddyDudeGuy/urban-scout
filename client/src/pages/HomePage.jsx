/*
 * home page - the first thing users see after logging in
 * alltrails-inspired design with a hero banner, region cards grid,
 * and a stats section at the bottom. users can subscribe to regions
 * they want to follow for places, transit, and news updates.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

/*
 * region card images keyed by index so each region gets a unique photo
 * these are pexels photos of different seoul neighborhoods
 */
const REGION_IMAGES = [
  'https://images.pexels.com/photos/18495179/pexels-photo-18495179.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/11314621/pexels-photo-11314621.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/31414675/pexels-photo-31414675.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
];

/*
 * fallback region names for the image alt text
 */
const REGION_LABELS = ['Downtown Seoul', 'Gangnam', 'Hongdae'];

export default function HomePage() {
  const { user, logout } = useAuth();
  const [regions, setRegions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [togglingId, setTogglingId] = useState(null);

  /*
   * fetch regions and user's subscriptions
   * runs on mount and whenever we need to refresh after a toggle
   */
  const loadData = useCallback(async () => {
    const [regRes, subRes] = await Promise.all([
      api.get('/api/regions'),
      api.get('/api/subscriptions'),
    ]);
    setRegions(regRes.data);
    setSubscriptions(subRes.data.map(s => s.RegionID));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /*
   * toggle subscription for a region then refresh the data
   * tracks which region is currently toggling so we can show a loading state
   */
  const handleToggle = async (region) => {
    setTogglingId(region.RegionID);
    try {
      if (subscriptions.includes(region.RegionID)) {
        await api.delete(`/api/subscriptions/${region.RegionID}`);
      } else {
        await api.post('/api/subscriptions', { regionId: region.RegionID });
      }
      await loadData();
    } catch (err) {
      console.error(err);
    }
    setTogglingId(null);
  };

  return (
    <div className="pb-24">

      {/* hero section with seoul skyline background and dark gradient overlay */}
      <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/31414677/pexels-photo-31414677.jpeg?auto=compress&cs=tinysrgb&w=1400&h=600&fit=crop"
          alt="Seoul skyline"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />

        {/* logout button pinned to the top-right of the hero */}
        <button
          onClick={logout}
          className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:bg-white/30 transition-colors"
        >
          Logout
        </button>

        {/* hero text centered in the banner */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Explore Seoul
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Welcome back, {user?.name}. Subscribe to regions and discover places, transit, and news.
          </p>
        </div>
      </div>

      {/* region cards grid section */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Popular Regions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region, idx) => {
            const isSubscribed = subscriptions.includes(region.RegionID);
            const isToggling = togglingId === region.RegionID;

            return (
              <div
                key={region.RegionID}
                className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white group"
              >
                {/* card image with hover zoom effect */}
                <div className="overflow-hidden">
                  <img
                    src={REGION_IMAGES[idx] || REGION_IMAGES[0]}
                    alt={REGION_LABELS[idx] || region.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* card body with region info and subscribe toggle */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800">{region.name}</h3>
                  <p className="text-gray-500 text-sm mt-1 mb-4">{region.description}</p>

                  <button
                    onClick={() => handleToggle(region)}
                    disabled={isToggling}
                    className={`w-full py-2 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
                      isSubscribed
                        ? 'bg-[#1E3A5F] text-white hover:bg-[#162d4a]'
                        : 'border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F]/10'
                    }`}
                  >
                    {isToggling ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* stats section at the bottom to show off what the app offers */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-[#1E3A5F]">7+</p>
              <p className="text-sm text-gray-500 mt-1">Places</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1E3A5F]">3</p>
              <p className="text-sm text-gray-500 mt-1">Transit Routes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1E3A5F]">Live</p>
              <p className="text-sm text-gray-500 mt-1">Safety Alerts</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
