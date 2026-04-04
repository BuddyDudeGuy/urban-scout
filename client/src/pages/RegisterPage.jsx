/*
 * registration page - creates a new user account
 * after registering it auto-logs in and sends them to the home page
 * matches the login page styling with the blue header banner
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [error, setError] = useState('');
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  /* sends the registration request and navigates home on success */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerUser(name, email, homeCity);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-seoul-bg">
      {/* header banner */}
      <div className="bg-gradient-to-r from-seoul-primary to-[#2d5a8e] text-white p-6 text-center">
        <h1 className="text-2xl font-bold">Join Urban Scout</h1>
        <p className="text-blue-200 text-sm">Start exploring Seoul today</p>
      </div>

      <div className="flex items-center justify-center p-6 min-h-[70vh]">
        <div className="w-full max-w-sm animate-slide-in">
          <h2 className="text-xl font-bold text-seoul-text mb-1">Create Account</h2>
          <p className="text-seoul-muted text-sm mb-6">You'll be able to choose regions to follow after signing up</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-3 bg-white focus:ring-2 focus:ring-seoul-primary-light focus:border-seoul-primary-light transition-colors outline-none"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-3 bg-white focus:ring-2 focus:ring-seoul-primary-light focus:border-seoul-primary-light transition-colors outline-none"
              required
            />
            <input
              type="text"
              placeholder="Home city (optional)"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 bg-white focus:ring-2 focus:ring-seoul-primary-light focus:border-seoul-primary-light transition-colors outline-none"
            />
            {error && <p className="text-seoul-secondary text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-seoul-secondary text-white py-3 rounded-lg font-medium cursor-pointer hover:bg-red-700 transition-all hover:shadow-lg"
            >
              Sign Up
            </button>
          </form>
          <p className="text-center mt-4 text-sm text-seoul-muted">
            Already have an account? <Link to="/login" className="text-seoul-primary-light hover:underline cursor-pointer">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
