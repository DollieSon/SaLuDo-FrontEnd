import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import UserForm from "./components/UserForm";
import ApiData from "./components/ApiData";
// import UserDashboard from './components/UserDashboard'
// import JobDashboard from './components/JobDashboard'
import JobForm from "./components/JobForm";
import { useEffect, useState } from "react";
import { fetchApiData } from "./utils/api";
import { Data } from "./types/data";
import "./App.css";
import { useAuth } from "./context/AuthContext";

// 🗂️ Your Dashboard and sub-components:
import Sidebar from "./components/Sidebar.tsx";
import Header from "./components/Header.tsx";
import CandidateList from "./components/CandidateList.tsx";
import AddCandidate from "./components/AddCandidate.tsx";
import JobList from "./components/JobList.tsx";
import CandidateForm from "./components/CandidateForm.tsx";
import SkillsManagement from "./components/SkillsManagement.tsx";
import Profile from "./components/Profile.tsx";
import JobDetails from "./components/JobDetails.tsx";
import CandidateSelector from "./components/CandidateSelector.tsx";
import CandidateComparison from "./components/CandidateComparison.tsx";
import UserManagement from "./components/UserManagement.tsx";
import AssignCandidate from "./components/AssignCandidate.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

// ✅ LOGIN PAGE AS A COMPONENT:
function AuthPage() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Always redirect to candidate list page
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Always redirect to candidate list page after login
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`container ${isRightPanelActive ? "right-panel-active" : ""}`}
      id="container"
    >
      {/* Sign Up Form */}
      <div className="form-container sign-up-container">
        <form className="app-form">
          <h2>Create Account</h2>
          <div className="social-icons">
            <button type="button">f</button>
            <button type="button">G</button>
            <button type="button">in</button>
          </div>
          <span>or use your email:</span>
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="button" className="submitbtn">
            Sign Up
          </button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className="form-container sign-in-container">
        <img src="/images/logo 1.png" className="logo" alt="Alliance Logo" />
        <form
          className="app-form"
          style={{ height: "80%" }}
          onSubmit={handleLogin}
        >
          <h2>Login</h2>
          {error && (
            <div
              style={{ color: "red", marginBottom: "10px", fontSize: "0.9rem" }}
            >
              {error}
            </div>
          )}
          <div className="social-icons">
            <button type="button">f</button>
            <button type="button">G</button>
            <button type="button">in</button>
          </div>
          <span>or use your account:</span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className="submitbtn" disabled={loading}>
            {loading ? "LOGGING IN..." : "LOG IN"}
          </button>
        </form>
      </div>

      {/* Overlay */}
      <div className="overlay-container">
        <div className="overlay">
          <img src="/images/logo 2.png" className="logo" alt="Alliance Logo" />
          {/* Overlay for Sign In */}
          <div className="overlay-panel overlay-left">
            <h2>Welcome Back!</h2>
            <p>
              To keep connected with us please login with your personal info
            </p>
            <button
              type="button"
              className="ghost"
              onClick={() => setIsRightPanelActive(false)}
            >
              LOG IN
            </button>
          </div>

          {/* Overlay for Sign Up */}
          <div className="overlay-panel overlay-right">
            <h2>New Here?</h2>
            <p>Enter your personal details and start your journey with us</p>
            <button
              type="button"
              className="ghost"
              onClick={() => setIsRightPanelActive(true)}
            >
              SIGN UP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type Props = {
  children: React.ReactNode;
};

function DashboardLayout({ children }: Props) {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        {/* <Header /> */}
        {children}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CandidateList />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function AddCandidatePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AddCandidate />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function JobListPage() {
  return (
    <ProtectedRoute requiredRole="hr_manager">
      <DashboardLayout>
        <JobList />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function SkillsManagementPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SkillsManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Profile />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function JobDetailsPage() {
  return (
    <ProtectedRoute requiredRole="hr_manager">
      <DashboardLayout>
        <JobDetails />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function JobFormPage() {
  return (
    <ProtectedRoute requiredRole="hr_manager">
      <DashboardLayout>
        <JobForm />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function CandidateFormPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const jobId = searchParams.get("jobId") || "";

  return (
    <ProtectedRoute>
      <CandidateForm jobId={jobId} />
    </ProtectedRoute>
  );
}

function CandidateSelectorPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CandidateSelector />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function CandidateComparisonPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CandidateComparison />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function UserManagementPage() {
  // For now, we'll use a mock token. In production, this should come from auth context
  const accessToken = localStorage.getItem("accessToken") || "";

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <UserManagement accessToken={accessToken} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function AssignCandidatePage() {
  return (
    <ProtectedRoute requiredRole="hr_manager">
      <DashboardLayout>
        <AssignCandidate />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function App() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetchApiData().then(setData);
  }, []);

  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={
          <div>
            <h1>Data from API:</h1>
            <ApiData data={data} />
          </div>
        } /> */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/userform" element={<UserForm />} />
        <Route path="/jobform" element={<JobFormPage />} />
        <Route path="/add-candidate" element={<AddCandidatePage />} />
        <Route path="/job-list" element={<JobListPage />} />
        <Route path="/job/:jobId" element={<JobDetailsPage />} />
        <Route path="/skills-management" element={<SkillsManagementPage />} />
        <Route path="/candidate-form" element={<CandidateFormPage />} />
        <Route path="/skills-management" element={<SkillsManagementPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/compare-candidates" element={<CandidateSelectorPage />} />
        <Route
          path="/compare/:candidateId1/:candidateId2"
          element={<CandidateComparisonPage />}
        />
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/assign-candidates" element={<AssignCandidatePage />} />
      </Routes>
    </Router>
  );
}

export default App;
