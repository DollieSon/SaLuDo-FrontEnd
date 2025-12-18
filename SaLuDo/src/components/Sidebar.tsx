import { NavLink, useNavigate } from "react-router-dom";
import "./css/Sidebar.css";
import { useAuth } from "../context/AuthContext";
import { NotificationBell } from "./NotificationBell";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/login");
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      admin: "Administrator",
      hr_manager: "HR Manager",
      hr_user: "HR User",
      recruiter: "Recruiter",
      interviewer: "Interviewer",
    };
    return roleNames[role] || role;
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/images/logo 2.png" alt="Alliance Logo" />
      </div>

      <div className="section-title">Main Menu</div>
      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <div className="nav-link-content">
            <img src="/images/list.png" alt="Candidate List" />
            Candidate List
          </div>
          {/* <span className="nav-link-badge">248</span> */}
        </NavLink>

        <NavLink
          to="/candidate-form"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <div className="nav-link-content">
            <img src="/images/add.png" alt="Add Candidate" />
            Add Candidate
          </div>
        </NavLink>

        <NavLink
          to="/skills-management"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <div className="nav-link-content">
            <img src="/images/analytics.png" alt="Analytics" />
            Skills Management
          </div>
        </NavLink>

        {/* Only show Job List for admins and hr_manager */}
        {(user?.role === "admin" || user?.role === "hr_manager") && (
          <NavLink
            to="/job-list"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <div className="nav-link-content">
              <img src="/images/job.png" alt="Job List" />
              Job List
            </div>
            {/* <span className="nav-link-badge">12</span> */}
          </NavLink>
        )}

        {/* Only show User Management for admins */}
        {user?.role === "admin" && (
          <NavLink
            to="/user-management"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <div className="nav-link-content">
              <img src="/images/analytics.png" alt="User Management" />
              User Management
            </div>
          </NavLink>
        )}

        {/* Audit logs reserved for admins */}
        {user?.role === "admin" && (
          <NavLink
            to="/audit-logs"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <div className="nav-link-content">
              <img src="/images/analytics.png" alt="Audit Logs" />
              Audit Logs
            </div>
          </NavLink>
        )}

        {/* Show Assign Candidates for admins and hr_manager */}
        {(user?.role === "admin" || user?.role === "hr_manager") && (
          <NavLink
            to="/assign-candidates"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <div className="nav-link-content">
              <img src="/images/analytics.png" alt="Assign Candidates" />
              Assign Candidates
            </div>
          </NavLink>
        )}

        {/* Show Dashboard for admins */}
        {(user?.role === "admin") && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <div className="nav-link-content">
              <img src="/images/dashboard.png" alt="Dashboard" />
              Dashboard
            </div>
          </NavLink>
        )}

        {/* Show Scoring Settings for admins and hr_manager */}
        {(user?.role === "admin" || user?.role === "hr_manager") && (
          <NavLink
            to="/scoring-settings"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <div className="nav-link-content">
              <img src="/images/analytics.png" alt="Scoring Settings" />
              Scoring Settings
            </div>
          </NavLink>
        )}

        {/* Show AI Metrics for admins */}
        {user?.role === "admin" && (
          <NavLink
            to="/ai-metrics"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <div className="nav-link-content">
              <img src="/images/analytics.png" alt="AI Metrics" />
              AI Metrics
            </div>
          </NavLink>
        )}
      </div>

      {/* User Profile Section */}
      <div className="user-profile">
        <div 
          className="user-profile-card" 
          onClick={() => user?.userId && navigate(`/user-profile/${user.userId}`)}
          style={{ cursor: 'pointer' }}
          title="View my profile"
        >
          <div className="user-avatar">
            {user?.photoMetadata ? (
              <img 
                key={new Date(user.photoMetadata.uploadedAt).getTime()}
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/'}users/${user.userId}/profile/photo?thumbnail=true&t=${new Date(user.photoMetadata.uploadedAt).getTime()}`}
                alt={user.fullName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.textContent = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;
                  }
                }}
              />
            ) : (
              <>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </>
            )}
          </div>
          <div className="user-info">
            <h4>{user?.fullName || "User"}</h4>
            <p>{user ? getRoleDisplayName(user.role) : "Role"}</p>
          </div>
          <NotificationBell />
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Logout">
        Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
