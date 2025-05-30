import { useEffect, useState } from 'react'
import './App.css'

interface Data{
  message: string
}

function App() {
  const [count, setCount] = useState(0)
  const [data,setData] = useState<Data|null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://saludo-backend.onrender.com/api/data')
      const json = await response.json()
      console.log(json)
      setData(json)
    }
    fetchData()
  },[])
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tempData = {
      name: formData.get('name'),
      age: formData.get('age'),
      email: formData.get('email'),
      address: formData.get('address'),
      resume: formData.get('resume'),
    };
    console.log('Form Data:', tempData);
    // You can use tempData as needed
  };
  return (
    <>
      <div>
        <div>
          <form onSubmit={handleFormSubmit}>
            <div>
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" />
            </div>
            <div>
              <label htmlFor="age">Age:</label>
              <input type="number" id="age" name="age" />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" />
            </div>
            <div>
              <label htmlFor="address">Address:</label>
              <input type="text" id="address" name="address" />
            </div>
            <div>
              <label htmlFor="resume">Resume (PDF):</label>
              <input type="file" id="resume" name="resume" accept="application/pdf" />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
        <h1>Data from API:</h1>
        {data != null ? <h2>{data.message}</h2> : <h2>Loading...</h2>}
      </div>
    </>
  )
}

export default App
