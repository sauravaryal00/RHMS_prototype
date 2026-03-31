// Mock Data for RHMS Dashboard

export const roles = [
  { id: 'patient', name: 'Patient', icon: '👴' },
  { id: 'clinician', name: 'Clinician', icon: '👨‍⚕️' },
  { id: 'caregiver', name: 'Caregiver', icon: '👵' },
  { id: 'admin', name: 'Admin', icon: '🏠' }
];

export const authModes = [
  { id: 'consent', name: 'Consent Token (Proposed)', description: 'Main system: Patient-controlled access', icon: '🔐' },
  { id: 'baseline1', name: 'Baseline 1: Password + OTP', description: 'Traditional multi-factor auth', icon: '📱' },
  { id: 'baseline2', name: 'Baseline 2: RBAC with Logging', description: 'Role-based access control', icon: '📋' },
  { id: 'baseline3', name: 'Baseline 3: Zero Trust Gateway', description: 'Session-based short-lived access', icon: '🛡️' }
];

export const mockVitals = {
  device_id: "dev-001",
  patient_id: "patient-42",
  timestamp: new Date().toISOString(),
  hr: 78,
  bp_sys: 122,
  bp_dia: 81,
  spo2: 97.4
};

export const mockConsentTokens = [
  {
    token_id: "tok_abc123",
    patient_id: "patient-42",
    clinician_id: "dr_sharma",
    clinician_role: "cardiologist",
    purpose: "symptom_review",
    scope: ["hr", "bp_sys", "bp_dia", "spo2"],
    issued_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    revoked: false,
    status: 'active'
  }
];

export const mockAuditLogs = [
  {
    event_id: 1042,
    timestamp: new Date().toISOString(),
    event_type: "ALLOW",
    patient_id: "patient-42",
    requester_id: "dr_sharma",
    requester_role: "clinician",
    purpose: "symptom_review",
    scope: ["hr", "bp_sys", "bp_dia"],
    decision: "allow",
    reason: null,
    prev_hash: "00000000000000000000000000000000",
    entry_hash: "a3f5b2..."
  }
];

export const anomalyRules = [
  { id: 'RULE-01', description: '>10 validate requests from same clinician for same patient within 60s', level: 'HIGH', threshold: 10 },
  { id: 'RULE-02', description: '3+ consecutive DENY (wrong_purpose) from same requester in 10 min', level: 'HIGH', threshold: 3 },
  { id: 'RULE-03', description: 'VALIDATE request >2 hours outside registered working hours', level: 'MEDIUM', threshold: 1 },
  { id: 'RULE-04', description: 'VALIDATE request with no active token', level: 'HIGH', threshold: 1 },
  { id: 'RULE-05', description: 'Single patient accessed by >5 distinct clinicians within 24h', level: 'MEDIUM', threshold: 5 }
];
