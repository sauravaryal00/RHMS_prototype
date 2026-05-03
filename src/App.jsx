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
import SecurityTerminal from './pages/SecurityTerminal'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-text-primary font-outfit">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/:role" element={<LoginPage />} />
            
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/terminal" element={<ProtectedRoute><SecurityTerminal /></ProtectedRoute>} />
            <Route path="/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
            <Route path="/clinician" element={<ProtectedRoute><ClinicianDashboard /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><AuditLogViewer /></ProtectedRoute>} />
            <Route path="/caregiver" element={<ProtectedRoute><CaregiverDashboard /></ProtectedRoute>} />
            <Route path="/anomalies" element={<ProtectedRoute><AnomalyDetection /></ProtectedRoute>} />
            <Route path="/baselines" element={<ProtectedRoute><BaselineComparison /></ProtectedRoute>} />
            <Route path="/experiments" element={<ProtectedRoute><LoadTestResults /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SystemStatus /></ProtectedRoute>} />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
