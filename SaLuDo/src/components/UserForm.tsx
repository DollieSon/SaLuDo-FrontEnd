import React from 'react'

const UserForm: React.FC = () => {
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const tempData = {
      name: formData.get('name'),
      age: formData.get('age'),
      email: formData.get('email'),
      address: formData.get('address'),
      resume: formData.get('resume'),
    }
    console.log('Form Data:', tempData)
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" required />
      </div>
      <div>
        <label htmlFor="age">Age:</label>
        <input type="number" id="age" name="age" required />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />
      </div>
      <div>
        <label htmlFor="address">Address:</label>
        <input type="text" id="address" name="address" />
      </div>
      <div>
        <label htmlFor="resume">Resume:</label>
        <input type="file" id="resume" name="resume" />
      </div>
      <button type="submit">Submit</button>
    </form>
  )
}

export default UserForm