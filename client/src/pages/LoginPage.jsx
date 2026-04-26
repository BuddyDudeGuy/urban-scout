/*
 * login page - split layout with seoul branding on the left and login form on the right
 * has a toggle to switch between user and admin login
 * on mobile it stacks vertically with a shorter hero banner on top
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const { loginUser, loginAdmin } = useAuth();
  const navigate = useNavigate();

  /*
   * handles login for both user and admin depending on the toggle
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isAdmin) {
        await loginAdmin(email);
        navigate('/admin');
      } else {
        await loginUser(email);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen md:grid md:grid-cols-2">
      {/* left panel - app branding with seoul theme */}
      <div className="hidden md:flex flex-col justify-center items-start p-12 text-white relative overflow-hidden">
        <img src="https://images.pexels.com/photos/12640885/pexels-photo-12640885.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F]/90 to-[#2d5a8e]/80" />
        <div className="animate-fade-up relative z-10">
          <h1 className="text-4xl font-bold mb-2">Urban Scout</h1>
          <p className="text-xl text-blue-200 mb-1">Explore Seoul, Your Way</p>
          <p className="text-lg text-blue-300 mb-8">서울을 탐험하세요</p>

          <div className="space-y-4 text-blue-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <span>Discover landmarks, restaurants & transit stations</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚇</span>
              <span>Real-time transit routes & schedules</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📰</span>
              <span>Local news & safety alerts</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <span>Plan your perfect trip itinerary</span>
            </div>
          </div>
        </div>

        {/* subtle decorative circles in the background */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full"></div>
      </div>

      {/* mobile hero banner - shown only on small screens */}
      <div className="md:hidden bg-gradient-to-r from-seoul-primary to-[#2d5a8e] text-white p-6 text-center">
        <h1 className="text-2xl font-bold">Urban Scout</h1>
        <p className="text-blue-200 text-sm">Explore Seoul, Your Way · 서울을 탐험하세요</p>
      </div>

      {/* right panel - login form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-seoul-bg min-h-[70vh] md:min-h-screen">
        <div className="w-full max-w-sm animate-slide-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 mb-6">Sign in to continue exploring</p>

          {/* toggle between user and admin login */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsAdmin(false)}
              className={
                !isAdmin
                  ? 'rounded-full bg-[#1E3A5F] text-white px-4 py-2 text-sm font-semibold cursor-pointer transition-colors'
                  : 'rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 text-sm font-semibold cursor-pointer transition-colors'
              }
            >
              User
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={
                isAdmin
                  ? 'rounded-full bg-[#1E3A5F] text-white px-4 py-2 text-sm font-semibold cursor-pointer transition-colors'
                  : 'rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 text-sm font-semibold cursor-pointer transition-colors'
              }
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-4"
              required
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] w-full py-3 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Log In
            </button>
          </form>

          {!isAdmin && (
            <p className="text-center mt-4 text-sm text-gray-500">
              New here? <Link to="/register" className="text-[#3B82F6] hover:underline cursor-pointer">Create account</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
