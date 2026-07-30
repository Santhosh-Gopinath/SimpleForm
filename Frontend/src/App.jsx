import { useState } from 'react'
import Form from './Form/form'
import Table from './Table/table'
import './App.css'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSubmitSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div id="split">
      <div className="left-panel">
        <Form onSubmitSuccess={handleSubmitSuccess} />
      </div>

      <div className="divider">
        <span></span>
        <span></span>
      </div>

      <div className="right-panel">
        <Table refreshKey={refreshKey} />
      </div>
    </div>
  )
}

export default App
