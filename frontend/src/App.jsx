import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Header from './components/Header'
import InfoBar from './components/InfoBar'
import Upload from './components/Upload'
import VerifiedPapers from './components/VerifiedPapers'

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page Route with Navbar */}
        <Route path="/" element={
          <>
            <Navbar />
            <Header />
            <InfoBar />
          </>
        } />

        {/* Upload Page Route without Navbar */}
        <Route path="/upload" element={<Upload />} />

        {/* Verified Papers Page Route without Navbar */}
        <Route path="/verified-papers" element={<VerifiedPapers />} />
      </Routes>
    </Router>
  )
}

export default App
