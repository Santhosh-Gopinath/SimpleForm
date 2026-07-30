import { useState, useEffect } from 'react'
import axios from 'axios'
import './table.css'

function Table({ refreshKey }) {
  const [tableData, setTableData] = useState([])

  const fetchTableData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/table')
      setTableData(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchTableData()
  }, [refreshKey])

  return (
    <div className="table-card">
      <h1>Submitted Records</h1>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Mail</th>
              <th>Phone</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={row._id}>
                <td>{index + 1}</td>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.phone}</td>
                <td>{row.dob}</td>
                <td>{row.gender}</td>
                <td>{row.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="total-count">Total entries: {tableData.length}</p>
    </div>
  )
}

export default Table
