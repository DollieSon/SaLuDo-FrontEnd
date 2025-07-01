import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import UserForm from './components/UserForm'
import ApiData from './components/ApiData'
// import UserDashboard from './components/UserDashboard'
// import JobDashboard from './components/JobDashboard'
import JobForm from './components/JobForm'
import { useEffect, useState } from 'react'
import { fetchApiData } from './utils/api'
import { Data } from './types/data'
import './App.css'

// 🗂️ Your Dashboard and sub-components:
import Sidebar from './components/Sidebar.tsx'
import Header from './components/Header.tsx'
import CandidateList from './components/CandidateList.tsx'
import AddCandidate from './components/AddCandidate.tsx'
import JobList from './components/JobList.tsx'
import CandidateForm from './components/CandidateForm.tsx'
import SkillsManagement from './components/SkillsManagement.tsx'

// ✅ LOGIN PAGE AS A COMPONENT:
function AuthPage() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    // ✅ Here you can add real validation later.
    navigate('/dashboard'); // This changes the URL to your dashboard page.
  };

  return (
    <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
      {/* Sign Up Form */}
      <div className="form-container sign-up-container">
        <form className='app-form'>
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
          <button type="button" className="submitbtn">Sign Up</button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className="form-container sign-in-container">
        <img src="/images/logo 1.png" className="logo" alt="Alliance Logo" />
        <form className='app-form' style={{ height: '80%' }}>
          <h2>Login</h2>
          <div className="social-icons">
            <button type="button">f</button>
            <button type="button">G</button>
            <button type="button">in</button>
          </div>
          <span>or use your account:</span>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button
            type="button"
            className="submitbtn"
            onClick={handleLogin}
          >
            LOG IN
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
            <p>To keep connected with us please login with your personal info</p>
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
  )
}

type Props = {
  children: React.ReactNode;
};

function DashboardLayout({ children }: Props) {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Header />
        {children}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <DashboardLayout>
      <CandidateList />
    </DashboardLayout>
  )
}

function AddCandidatePage() {
  return (
    <DashboardLayout>
      <AddCandidate />
    </DashboardLayout>
  );
}

function JobListPage() {
  return (
    <DashboardLayout>
      <JobList />
    </DashboardLayout>
  );
}

function SkillsManagementPage() {
  return (
    <DashboardLayout>
      <SkillsManagement />
    </DashboardLayout>
  );
}

function CandidateFormPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const jobId = searchParams.get('jobId') || '';

  return <CandidateForm jobId={jobId} />;
}

function App() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetchApiData().then(setData)
  }, [])

  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={
          <div>
            <h1>Data from API:</h1>
            <ApiData data={data} />
          </div>
        } /> */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/userform" element={<UserForm />} />
        <Route path="/jobform" element={<JobForm />} />
        <Route path="/add-candidate" element={<AddCandidatePage />} />
        <Route path="/job-list" element={<JobListPage />} />
        <Route path="/skills-management" element={<SkillsManagementPage />} />
        <Route path="/candidate-form" element={<CandidateFormPage />} />
        <Route path="/skills-management" element={<SkillsManagementPage />} />
      </Routes>
    </Router>
  )
}

export default App
