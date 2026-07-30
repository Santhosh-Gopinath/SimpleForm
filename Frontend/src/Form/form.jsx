import { useState } from 'react'
import axios from 'axios'
import './form.css'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  address: '',
}

function Form({ onSubmitSuccess }) {
  const [form, setForm] = useState(initialForm)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3000/api/forms', form)
      alert('Form submitted successfully')
      setForm(initialForm)
      onSubmitSuccess()
    } catch (err) {
      alert('Something went wrong. Please try again.')
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Hurryep Technologies</h1>

      <label>Full Name</label>
      <input type="text" name="name" value={form.name} onChange={handleChange} required />

      <label>Email</label>
      <input type="email" name="email" value={form.email} onChange={handleChange} required />

      <label>Phone Number</label>
      <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />

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
      <textarea name="address" value={form.address} onChange={handleChange} required></textarea>

      <button type="submit">Submit</button>
    </form>
  )
}

export default Form
