import React from 'react'

const UserForm: React.FC = () => {
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
        console.log('formData', formData)
        console.log(Object.fromEntries(formData.entries()))
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        alert('User data submitted successfully!')
      } else {
        alert('Failed to submit user data.')
      }
    } catch (error) {
      alert('An error occurred while submitting the form.')
    }
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