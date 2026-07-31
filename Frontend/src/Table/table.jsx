import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import Form from '../Form/form'
import './table.css'

const emptyEditForm = {
  name: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  address: '',
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

function Table({ refreshKey, onDataChanged }) {
  const [tableData, setTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [editingRow, setEditingRow] = useState(null)
  const [editForm, setEditForm] = useState(emptyEditForm)

  const [viewingRow, setViewingRow] = useState(null)

  const [confirmAction, setConfirmAction] = useState(null)
  // confirmAction shape: { type: 'update' | 'delete-single' | 'delete-bulk', payload }

  const [showAddModal, setShowAddModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const editDobRef = useRef(null)
  const openDatePicker = (ref) => {
    if (ref.current?.showPicker) {
      ref.current.showPicker()
    } else if (ref.current) {
      ref.current.focus()
    }
  }

  const fetchTableData = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/table', {
        params: { page: currentPage, limit: Number(itemsPerPage) || 5, search: searchTerm },
      })
      setTableData(res.data.data)
      setTotalCount(res.data.totalCount)
      setTotalPages(res.data.totalPages)
      setSelectedIds([])
    } catch (err) {
      console.error(err)
    }
  }, [currentPage, itemsPerPage, searchTerm])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await fetchTableData()
      if (cancelled) return
    })()
    return () => {
      cancelled = true
    }
  }, [refreshKey, fetchTableData])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePerPageChange = (e) => {
    const raw = e.target.value

    // allow the field to be temporarily empty while typing
    if (raw === '') {
      setItemsPerPage('')
      return
    }

    const value = Number(raw)
    if (!Number.isFinite(value) || value < 1) return
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const handlePerPageBlur = () => {
    // if left empty or invalid on blur, fall back to a safe default
    if (itemsPerPage === '' || Number(itemsPerPage) < 1) {
      setItemsPerPage(5)
      setCurrentPage(1)
    }
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const getVisiblePages = () => {
    const maxVisible = 3
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    let start = currentPage
    const maxStart = totalPages - maxVisible + 1
    if (start > maxStart) start = maxStart
    if (start < 1) start = 1
    return Array.from({ length: maxVisible }, (_, i) => start + i)
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

  // ---- view modal ----
  const openViewModal = (row) => {
    setViewingRow(row)
  }

  const closeViewModal = () => {
    setViewingRow(null)
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
      employeeId: row.employeeId || '',
      designation: row.designation || '',
      department: row.department || '',
      dateOfJoining: row.dateOfJoining || '',
      employmentType: row.employmentType || '',
      employmentStatus: row.employmentStatus || 'Active',
      reportingManager: row.reportingManager || '',
      bloodGroup: row.bloodGroup || '',
      emergencyContact: row.emergencyContact || '',
      qualification: row.qualification || '',
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

  // ---- add data popup ----
  const openAddModal = () => setShowAddModal(true)
  const closeAddModal = () => setShowAddModal(false)

  const handleAddSuccess = () => {
    closeAddModal()
    fetchTableData()
    if (onDataChanged) onDataChanged()
  }

  // ---- export to pdf ----
  const handleExportPdf = async () => {
    setIsExporting(true)
    try {
      const res = await axios.get('http://localhost:3000/api/table/export-pdf', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Employee-Bio-Data.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Something went wrong while exporting the PDF. Please try again.')
    } finally {
      setIsExporting(false)
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
      <div className="title-row">
        <div className="heading-block">
          <h1 className="brand-heading">Hurryep Technology</h1>
          <h2 className="section-heading">Employee Data Record</h2>
        </div>

        <div className="header-btn-stack">
          <button className="add-data-btn" onClick={openAddModal}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add Data
          </button>

          <button className="export-btn" onClick={handleExportPdf} disabled={isExporting}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isExporting ? 'Exporting...' : 'Export to PDF'}
          </button>
        </div>
      </div>

      <div className="toolbar-row">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="toolbar-right">
          {selectedIds.length > 0 && (
            <button className="bulk-delete-btn" onClick={requestDeleteBulk}>
              Delete Selected ({selectedIds.length})
            </button>
          )}

          <div className="pagination">
            <button
              className="page-arrow"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {getVisiblePages().map((page) => (
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
            <input
              type="number"
              min="1"
              value={itemsPerPage}
              onChange={handlePerPageChange}
              onBlur={handlePerPageBlur}
            />
          </div>
        </div>
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
                  <span className={`gender-badge gender-${row.gender}`}>{genderLabel(row.gender)}</span>
                </td>
                <td className="address-cell">{row.address}</td>
                <td className="actions-col">
                  <button
                    className="icon-btn view-btn"
                    title="View"
                    onClick={() => openViewModal(row)}
                  >
                    👁️
                  </button>
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
      </div>

      {/* ---- View Modal ---- */}
      {viewingRow && (
        <div className="modal-overlay">
          <div className="modal-box view-box">
            <h2>Record Details</h2>

            <div className="view-field">
              <span className="view-label">Full Name</span>
              <span className="view-value">{viewingRow.name}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Email</span>
              <span className="view-value">{viewingRow.email}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Phone Number</span>
              <span className="view-value">{viewingRow.phone}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Date of Birth</span>
              <span className="view-value">{viewingRow.dob}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Gender</span>
              <span className="view-value">
                <span className={`gender-badge gender-${viewingRow.gender}`}>
                  {genderLabel(viewingRow.gender)}
                </span>
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Address</span>
              <span className="view-value view-address">{viewingRow.address}</span>
            </div>

            <h3 className="view-section-title">Employee Details</h3>

            <div className="view-field">
              <span className="view-label">Employee ID</span>
              <span className="view-value">{viewingRow.employeeId || '—'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Designation</span>
              <span className="view-value">{viewingRow.designation || '—'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Department</span>
              <span className="view-value">{viewingRow.department || '—'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Date of Joining</span>
              <span className="view-value">{viewingRow.dateOfJoining || '—'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Employment Type</span>
              <span className="view-value">{viewingRow.employmentType || '—'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Employment Status</span>
              <span className="view-value">{viewingRow.employmentStatus || '—'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Reporting Manager</span>
              <span className="view-value">{viewingRow.reportingManager || '—'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Blood Group</span>
              <span className="view-value">{viewingRow.bloodGroup || '—'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Emergency Contact</span>
              <span className="view-value">{viewingRow.emergencyContact || '—'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Highest Qualification</span>
              <span className="view-value">{viewingRow.qualification || '—'}</span>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={closeViewModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="date-input-wrapper">
                <input
                  ref={editDobRef}
                  type="date"
                  name="dob"
                  value={editForm.dob}
                  onChange={handleEditChange}
                  required
                />
                <button
                  type="button"
                  className="date-icon-btn"
                  title="Open calendar"
                  onClick={() => openDatePicker(editDobRef)}
                >
                  📅
                </button>
              </div>

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

              <h3 className="modal-section-title">Employee Details</h3>

              <label>Employee ID</label>
              <input type="text" name="employeeId" value={editForm.employeeId} onChange={handleEditChange} />

              <label>Designation</label>
              <input type="text" name="designation" value={editForm.designation} onChange={handleEditChange} />

              <label>Department</label>
              <input type="text" name="department" value={editForm.department} onChange={handleEditChange} />

              <label>Date of Joining</label>
              <input type="date" name="dateOfJoining" value={editForm.dateOfJoining} onChange={handleEditChange} />

              <label>Employment Type</label>
              <select name="employmentType" value={editForm.employmentType} onChange={handleEditChange}>
                <option value="">Select</option>
                <option value="Full-time">Full-time</option>
                <option value="Intern">Intern</option>
                <option value="Contract">Contract</option>
              </select>

              <label>Employment Status</label>
              <select name="employmentStatus" value={editForm.employmentStatus} onChange={handleEditChange}>
                <option value="Active">Active</option>
                <option value="Resigned">Resigned</option>
                <option value="On Leave">On Leave</option>
              </select>

              <label>Reporting Manager</label>
              <input type="text" name="reportingManager" value={editForm.reportingManager} onChange={handleEditChange} />

              <label>Blood Group</label>
              <input type="text" name="bloodGroup" value={editForm.bloodGroup} onChange={handleEditChange} />

              <label>Emergency Contact</label>
              <input type="tel" name="emergencyContact" value={editForm.emergencyContact} onChange={handleEditChange} />

              <label>Highest Qualification</label>
              <input type="text" name="qualification" value={editForm.qualification} onChange={handleEditChange} />

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

      {/* ---- Add Data Modal ---- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box add-box">
            <button type="button" className="modal-close-btn" onClick={closeAddModal} aria-label="Close">
              &times;
            </button>
            <Form onSubmitSuccess={handleAddSuccess} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Table