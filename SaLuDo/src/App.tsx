import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import UserForm from './components/UserForm'
import ApiData from './components/ApiData'
import Dashboard from './components/Dashboard'
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
        <Link to="/">Home</Link> | <Link to="/form">User Form</Link> | <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={
          <div>
            <h1>Data from API:</h1>
            <ApiData data={data} />
          </div>
        } />
        <Route path="/form" element={<UserForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  )
}

export default App
