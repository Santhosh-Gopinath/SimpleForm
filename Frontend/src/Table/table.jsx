import { useState, useEffect } from 'react'
import axios from 'axios'
import './table.css'

const emptyEditForm = {
  name: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  address: '',
}

function Table({ refreshKey, onDataChanged }) {
  const [tableData, setTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState([])

  const [editingRow, setEditingRow] = useState(null)
  const [editForm, setEditForm] = useState(emptyEditForm)

  const [confirmAction, setConfirmAction] = useState(null)
  // confirmAction shape: { type: 'update' | 'delete-single' | 'delete-bulk', payload }

  const fetchTableData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/table', {
        params: { page: currentPage, limit: itemsPerPage },
      })
      setTableData(res.data.data)
      setTotalCount(res.data.totalCount)
      setTotalPages(res.data.totalPages)
      setSelectedIds([])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchTableData()
  }, [refreshKey, currentPage, itemsPerPage])

  const handlePerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage

  // ---- selection ----
  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === tableData.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(tableData.map((row) => row._id))
    }
  }

  // ---- edit modal ----
  const openEditModal = (row) => {
    setEditingRow(row)
    setEditForm({
      name: row.name,
      email: row.email,
      phone: row.phone,
      dob: row.dob,
      gender: row.gender,
      address: row.address,
    })
  }

  const closeEditModal = () => {
    setEditingRow(null)
    setEditForm(emptyEditForm)
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    setConfirmAction({ type: 'update', payload: editingRow })
  }

  const performUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/api/table/${editingRow._id}`, editForm)
      setConfirmAction(null)
      closeEditModal()
      alert(`${editForm.name}'s data has been updated successfully`)
      fetchTableData()
      if (onDataChanged) onDataChanged()
    } catch (err) {
      console.error(err)
      alert('Something went wrong while updating. Please try again.')
      setConfirmAction(null)
    }
  }

  // ---- delete ----
  const requestDeleteSingle = (row) => {
    setConfirmAction({ type: 'delete-single', payload: row })
  }

  const requestDeleteBulk = () => {
    if (selectedIds.length === 0) return
    setConfirmAction({ type: 'delete-bulk', payload: selectedIds })
  }

  const performDelete = async () => {
    try {
      if (confirmAction.type === 'delete-single') {
        await axios.delete(`http://localhost:3000/api/table/${confirmAction.payload._id}`)
      } else if (confirmAction.type === 'delete-bulk') {
        await axios.post('http://localhost:3000/api/table/bulk-delete', {
          ids: confirmAction.payload,
        })
      }
      setConfirmAction(null)
      alert('Selected data deleted successfully')
      fetchTableData()
      if (onDataChanged) onDataChanged()
    } catch (err) {
      console.error(err)
      alert('Something went wrong while deleting. Please try again.')
      setConfirmAction(null)
    }
  }

  const handleConfirmYes = () => {
    if (confirmAction.type === 'update') {
      performUpdate()
    } else {
      performDelete()
    }
  }

  const genderLabel = (value) => {
    if (value === 'male') return 'Male'
    if (value === 'female') return 'Female'
    if (value === 'other') return 'Other'
    return value
  }

  return (
    <div className="table-card">
      <div className="table-header-row">
        <h1>Submitted Records</h1>
        {selectedIds.length > 0 && (
          <button className="bulk-delete-btn" onClick={requestDeleteBulk}>
            Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={tableData.length > 0 && selectedIds.length === tableData.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>S.No</th>
              <th>Name</th>
              <th>Mail</th>
              <th>Phone</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Address</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={row._id} className={selectedIds.includes(row._id) ? 'row-selected' : ''}>
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row._id)}
                    onChange={() => toggleSelectRow(row._id)}
                  />
                </td>
                <td>{startIndex + index + 1}</td>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.phone}</td>
                <td>{row.dob}</td>
                <td>
                  <span className={`gender-badge gender-${row.gender}`}>
                    {genderLabel(row.gender)}
                  </span>
                </td>
                <td>{row.address}</td>
                <td className="actions-col">
                  <button
                    className="icon-btn edit-btn"
                    title="Update"
                    onClick={() => openEditModal(row)}
                  >
                    ✏️
                  </button>
                  <button
                    className="icon-btn delete-btn"
                    title="Delete"
                    onClick={() => requestDeleteSingle(row)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {tableData.length === 0 && (
              <tr>
                <td colSpan="9" className="empty-row">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p className="total-count">Total Entries: {totalCount}</p>

        <div className="pagination">
          <button
            className="page-arrow"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="page-arrow"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>

        <div className="per-page">
          <label>Show per Page:</label>
          <select value={itemsPerPage} onChange={handlePerPageChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* ---- Edit Modal ---- */}
      {editingRow && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Update Record</h2>
            <form onSubmit={handleEditSubmit}>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                required
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                required
              />

              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={editForm.phone}
                onChange={handleEditChange}
                required
              />

              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={editForm.dob}
                onChange={handleEditChange}
                required
              />

              <label>Gender</label>
              <select name="gender" value={editForm.gender} onChange={handleEditChange} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <label>Address</label>
              <textarea
                name="address"
                value={editForm.address}
                onChange={handleEditChange}
                required
              ></textarea>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Confirm Modal ---- */}
      {confirmAction && (
        <div className="modal-overlay">
          <div className="confirm-box">
            {confirmAction.type === 'update' && (
              <p>Are you sure you want to update {editForm.name}'s data?</p>
            )}
            {confirmAction.type === 'delete-single' && (
              <p>Confirm you want to delete this user's data</p>
            )}
            {confirmAction.type === 'delete-bulk' && (
              <p>Confirm you want to delete the selected user data</p>
            )}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setConfirmAction(null)}>
                Cancel
              </button>
              <button
                className={confirmAction.type === 'update' ? 'save-btn' : 'confirm-btn'}
                onClick={handleConfirmYes}
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Table
