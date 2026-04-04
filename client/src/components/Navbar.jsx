/*
 * bottom tab navigation bar - korean app style (kakao/naver map vibes)
 * clean white background with blur effect, compact native mobile feel
 * active tab gets a dot indicator + dark blue text, inactive is soft gray
 * shows different tabs depending on whether you're a user or admin
 * users get 6 tabs, admins get 3
 */
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* svg icon components - kept slim at w-5 h-5 for that compact mobile look */
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const PlacesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const TransitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="4" y="3" width="16" height="16" rx="2"/>
    <path d="M4 11h16"/>
    <path d="M12 3v8"/>
    <path d="m8 19-2 3"/>
    <path d="m18 22-2-3"/>
    <circle cx="9" cy="15" r="1"/>
    <circle cx="15" cy="15" r="1"/>
  </svg>
);

const NewsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
    <path d="M18 14h-8"/>
    <path d="M15 18h-5"/>
    <path d="M10 6h8v4h-8z"/>
  </svg>
);

const ReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
);

const TripsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4"/>
    <path d="M12 16h4"/>
    <path d="M8 11h.01"/>
    <path d="M8 16h.01"/>
  </svg>
);

/* admin icons - dashboard grid, search, and edit pencil */
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
  </svg>
);

const AdminReportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const AdminNewsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);

/*
 * single tab component - handles the active dot indicator, icon, and label
 * active tabs get dark blue text + a little dot on top, inactive is gray
 * wraps NavLink so we get the isActive state from react-router
 */
function Tab({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex flex-col items-center justify-center py-1.5 px-2 min-w-0 flex-1 cursor-pointer transition-colors ${
          isActive
            ? 'text-[#1E3A5F]'
            : 'text-gray-400 hover:text-gray-600'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute top-0.5 w-1 h-1 rounded-full bg-[#1E3A5F]" />
          )}
          <Icon />
          <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : ''}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, admin } = useAuth();

  /* don't show the nav if nobody's logged in */
  if (!user && !admin) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] safe-area-inset-bottom">
      <div className="flex justify-around items-center py-1.5">
        {user && (
          <>
            <Tab to="/" icon={HomeIcon} label="Home" />
            <Tab to="/places" icon={PlacesIcon} label="Places" />
            <Tab to="/transit" icon={TransitIcon} label="Transit" />
            <Tab to="/news" icon={NewsIcon} label="News" />
            <Tab to="/incidents/new" icon={ReportIcon} label="Report" />
            <Tab to="/itineraries" icon={TripsIcon} label="Trips" />
          </>
        )}
        {admin && (
          <>
            <Tab to="/admin" icon={DashboardIcon} label="Dashboard" />
            <Tab to="/admin/reports" icon={AdminReportsIcon} label="Reports" />
            <Tab to="/admin/news" icon={AdminNewsIcon} label="News" />
          </>
        )}
      </div>
    </nav>
  );
}
