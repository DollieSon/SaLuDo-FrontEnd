import { useEffect, useState } from 'react'
import './App.css'
import { fetchApiData } from './utils/api'
import { Data } from './types/data'
import UserForm from './components/UserForm'
import ApiData from './components/ApiData'

function App() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetchApiData().then(setData)
  }, [])

  return (
    <div>
      <UserForm />
      <h1>Data from API:</h1>
      <ApiData data={data} />
    </div>
  )
}

export default App
