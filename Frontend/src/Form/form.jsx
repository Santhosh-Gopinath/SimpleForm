import { useState, useRef } from 'react'
import axios from 'axios'
import './form.css'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  address: '',
  // ---- employee details ----
  employeeId: '',
  designation: '',
  department: '',
  dateOfJoining: '',
  employmentType: '',
  employmentStatus: 'Active',
  reportingManager: '',
  bloodGroup: '',
  emergencyContact: '',
  qualification: '',
}

function Form({ onSubmitSuccess }) {
  const [form, setForm] = useState(initialForm)
  const dobRef = useRef(null)
  const joiningRef = useRef(null)

  const openDatePicker = (ref) => {
    if (ref.current?.showPicker) {
      ref.current.showPicker()
    } else if (ref.current) {
      ref.current.focus()
    }
  }

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
      <div className="date-input-wrapper">
        <input ref={dobRef} type="date" name="dob" value={form.dob} onChange={handleChange} required />
        <button type="button" className="date-icon-btn" title="Open calendar" onClick={() => openDatePicker(dobRef)}>
          📅
        </button>
      </div>

      <label>Gender</label>
      <select name="gender" value={form.gender} onChange={handleChange} required>
        <option value="">Select</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      <label>Address</label>
      <textarea name="address" value={form.address} onChange={handleChange} required></textarea>

      <h2 className="section-divider">Employee Details</h2>

      <label>Employee ID</label>
      <input type="text" name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="eg. HTC-001" />

      <label>Designation</label>
      <input type="text" name="designation" value={form.designation} onChange={handleChange} placeholder="eg. Fullstack Developer" />

      <label>Department</label>
      <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="eg. Engineering" />

      <label>Date of Joining</label>
      <div className="date-input-wrapper">
        <input ref={joiningRef} type="date" name="dateOfJoining" value={form.dateOfJoining} onChange={handleChange} />
        <button type="button" className="date-icon-btn" title="Open calendar" onClick={() => openDatePicker(joiningRef)}>
          📅
        </button>
      </div>

      <label>Employment Type</label>
      <select name="employmentType" value={form.employmentType} onChange={handleChange}>
        <option value="">Select</option>
        <option value="Full-time">Full-time</option>
        <option value="Intern">Intern</option>
        <option value="Contract">Contract</option>
      </select>

      <label>Employment Status</label>
      <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange}>
        <option value="Active">Active</option>
        <option value="Resigned">Resigned</option>
        <option value="On Leave">On Leave</option>
      </select>

      <label>Reporting Manager</label>
      <input type="text" name="reportingManager" value={form.reportingManager} onChange={handleChange} />

      <label>Blood Group</label>
      <input type="text" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="eg. O+" />

      <label>Emergency Contact</label>
      <input type="tel" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />

      <label>Highest Qualification</label>
      <input type="text" name="qualification" value={form.qualification} onChange={handleChange} placeholder="eg. B.Tech AI & DS" />

      <button type="submit">Submit</button>
    </form>
  )
}

export default Form