import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import PatientDashboard from './pages/PatientDashboard'
import ClinicianDashboard from './pages/ClinicianDashboard'
import AuditLogViewer from './pages/AuditLogViewer'
import CaregiverDashboard from './pages/CaregiverDashboard'
import AnomalyDetection from './pages/AnomalyDetection'
import BaselineComparison from './pages/BaselineComparison'
import LoadTestResults from './pages/LoadTestResults'
import SystemStatus from './pages/SystemStatus'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text-primary font-outfit">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/clinician" element={<ClinicianDashboard />} />
          <Route path="/audit" element={<AuditLogViewer />} />
          <Route path="/caregiver" element={<CaregiverDashboard />} />
          <Route path="/anomalies" element={<AnomalyDetection />} />
          <Route path="/baselines" element={<BaselineComparison />} />
          <Route path="/experiments" element={<LoadTestResults />} />
          <Route path="/settings" element={<SystemStatus />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
