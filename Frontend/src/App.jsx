import { useState } from 'react'
import './App.css'

function App() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const initialForm = {
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:3000/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed to submit')

      alert('Form submitted successfully')
      setForm(initialForm)
    } catch (err) {
      alert('Something went wrong. Please try again.')
      console.error(err)
    }
  }

  return (
    <div id="center">
      <form onSubmit={handleSubmit}>
        <h1>Hurryep Technologies</h1>

        <label>Full Name</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Enter the Name" />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Enter the Email" />

        <label>Phone Number</label>
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="Enter the Phone Number" />

        <label>Date of Birth</label>
        <input type="date" name="dob" value={form.dob} onChange={handleChange} required />

        <label>Gender</label>
        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <label>Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} required placeholder="Enter the Address"></textarea>

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default App