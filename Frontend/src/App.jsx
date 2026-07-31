import { useState } from 'react'
import Table from './Table/table'
import './App.css'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDataChanged = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div id="app-shell">
      <Table refreshKey={refreshKey} onDataChanged={handleDataChanged} />
    </div>
  )
}

export default App
