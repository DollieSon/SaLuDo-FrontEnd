import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import UserForm from './components/UserForm'
import ApiData from './components/ApiData'
import UserDashboard from './components/UserDashboard'
import JobDashboard from './components/JobDashboard'
import JobForm from './components/JobForm'
import { useEffect, useState } from 'react'
import { fetchApiData } from './utils/api'
import { Data } from './types/data'
import './App.css'

function App() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetchApiData().then(setData)
  }, [])

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/userform">User Form</Link> | <Link to="/userdashboard">Users Dashboard</Link> | <Link to="/jobform">Job Form</Link> | <Link to="/jobdashboard">Job Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={
          <div>
            <h1>Data from API:</h1>
            <ApiData data={data} />
          </div>
        } />
        <Route path="/userform" element={<UserForm />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/jobform" element={<JobForm />} />
        <Route path="/jobdashboard" element={<JobDashboard />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  )
}

export default App
