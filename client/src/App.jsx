// main app component - sets up all the routes and wraps protected ones
// user routes and admin routes are separate, each behind their own auth guard
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import PlacesPage from './pages/PlacesPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import TransitPage from './pages/TransitPage';
import NewsPage from './pages/NewsPage';
import IncidentPage from './pages/IncidentPage';
import ItineraryPage from './pages/ItineraryPage';
import ItineraryDetailPage from './pages/ItineraryDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VerifyReports from './pages/admin/VerifyReports';
import ManageNews from './pages/admin/ManageNews';
import ManagePlaces from './pages/admin/ManagePlaces';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-seoul-bg">
      <Routes>
        {/* public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* user routes - need to be logged in as a user */}
        <Route path="/" element={<ProtectedRoute role="user"><HomePage /></ProtectedRoute>} />
        <Route path="/places" element={<ProtectedRoute role="user"><PlacesPage /></ProtectedRoute>} />
        <Route path="/places/:id" element={<ProtectedRoute role="user"><PlaceDetailPage /></ProtectedRoute>} />
        <Route path="/transit" element={<ProtectedRoute role="user"><TransitPage /></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute role="user"><NewsPage /></ProtectedRoute>} />
        <Route path="/incidents/new" element={<ProtectedRoute role="user"><IncidentPage /></ProtectedRoute>} />
        <Route path="/itineraries" element={<ProtectedRoute role="user"><ItineraryPage /></ProtectedRoute>} />
        <Route path="/itineraries/:id" element={<ProtectedRoute role="user"><ItineraryDetailPage /></ProtectedRoute>} />

        {/* admin routes - need to be logged in as an admin */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute role="admin"><VerifyReports /></ProtectedRoute>} />
        <Route path="/admin/news" element={<ProtectedRoute role="admin"><ManageNews /></ProtectedRoute>} />
        <Route path="/admin/places" element={<ProtectedRoute role="admin"><ManagePlaces /></ProtectedRoute>} />

        {/* catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <Navbar />
    </div>
  );
}
