import sqlite3
import time
import json
import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="RHMS Backend Prototype")

# Database Initialization
DB_PATH = "rhms_audit.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS audit_logs
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  timestamp TEXT,
                  user_id TEXT,
                  action TEXT,
                  resource TEXT,
                  purpose TEXT,
                  policy_mode TEXT,
                  status TEXT,
                  details TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS consent_tokens
                 (token_id TEXT PRIMARY KEY,
                  patient_id TEXT,
                  clinician_id TEXT,
                  purpose TEXT,
                  expiry TEXT,
                  status TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS care_pair_requests
                 (request_id TEXT PRIMARY KEY,
                  patient_id TEXT,
                  clinician_id TEXT,
                  status TEXT,
                  timestamp TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS otp_codes
                 (user_id TEXT PRIMARY KEY,
                  code TEXT,
                  expiry TEXT,
                  is_verified INTEGER DEFAULT 0)''')
    c.execute('''CREATE TABLE IF NOT EXISTS trusted_contexts
                 (entity_id TEXT PRIMARY KEY,
                  context_type TEXT,
                  context_value TEXT)''')
    conn.commit()
    conn.close()

init_db()

# Models
class ConsentRequest(BaseModel):
    patient_id: str
    clinician_id: str
    purpose: str
    duration_minutes: int = 60

class CarePairRequest(BaseModel):
    patient_id: str
    clinician_id: str

class OTPRequest(BaseModel):
    user_id: str

class OTPVerify(BaseModel):
    user_id: str
    code: str

# Helper Functions
def log_audit(user_id, action, resource, purpose, policy_mode, status, details=""):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO audit_logs (timestamp, user_id, action, resource, purpose, policy_mode, status, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              (datetime.now().isoformat(), user_id, action, resource, purpose, policy_mode, status, details))
    conn.commit()
    conn.close()

# Current Policy Mode (Simplified for Prototype)
CURRENT_POLICY_MODE = "CONSENT_MODE" # Default
ALLOWED_IP = "127.0.0.1"
@app.get("/system/metrics")
async def get_metrics():
    import csv
    results = []
    try:
        with open('thesis_metrics_results.csv', mode='r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                results.append(row)
    except FileNotFoundError:
        return {"status": "error", "message": "Run experiments first"}
    return results

@app.get("/system/policy")
async def get_policy():
    return {"mode": CURRENT_POLICY_MODE}

@app.post("/system/policy")
async def update_policy(data: dict):
    global CURRENT_POLICY_MODE
    new_mode = data.get("mode")
    new_ip = data.get("allowed_ip")
    
    if new_mode in ["CONSENT_MODE", "PASSWORD_OTP_MODE", "LOGGING_ONLY_MODE", "ZERO_TRUST_MODE"]:
        CURRENT_POLICY_MODE = new_mode
        if new_ip:
            # Persistent storage for the trusted IP
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("INSERT OR REPLACE INTO trusted_contexts VALUES (?, ?, ?)", ("ADMIN_OVERRIDE", "IP_ADDRESS", new_ip))
            conn.commit()
            conn.close()
        return {"status": "success", "mode": CURRENT_POLICY_MODE}
    return {"status": "error", "message": "Invalid mode"}


# Consent API
@app.post("/consent/issue")
async def issue_consent(req: ConsentRequest):
    token_id = str(uuid.uuid4())
    expiry = (datetime.now() + timedelta(minutes=req.duration_minutes)).isoformat()
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO consent_tokens VALUES (?, ?, ?, ?, ?, ?)",
              (token_id, req.patient_id, req.clinician_id, req.purpose, expiry, "ACTIVE"))
    conn.commit()
    conn.close()
    
    log_audit(req.patient_id, "ISSUE_CONSENT", "HEALTH_DATA", req.purpose, CURRENT_POLICY_MODE, "SUCCESS", f"Token {token_id} issued")
    
    return {"token_id": token_id, "expiry": expiry}

@app.post("/consent/revoke")
async def revoke_consent(token_id: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE consent_tokens SET status='REVOKED' WHERE token_id=?", (token_id,))
    conn.commit()
    conn.close()
    
    log_audit("SYSTEM", "REVOKE_CONSENT", "HEALTH_DATA", "N/A", CURRENT_POLICY_MODE, "SUCCESS", f"Token {token_id} revoked")
    
    return {"status": "revoked"}

@app.get("/consent/validate/{token_id}")
async def validate_consent(token_id: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM consent_tokens WHERE token_id=?", (token_id,))
    token = c.fetchone()
    conn.close()
    
    if not token:
        log_audit("SYSTEM", "VALIDATE_CONSENT", "HEALTH_DATA", "N/A", CURRENT_POLICY_MODE, "FAILURE", f"Invalid token {token_id}")
        return {"valid": False, "reason": "Invalid token"}
    
    expiry = datetime.fromisoformat(token[4])
    if datetime.now() > expiry or token[5] != "ACTIVE":
        log_audit("SYSTEM", "VALIDATE_CONSENT", "HEALTH_DATA", token[3], CURRENT_POLICY_MODE, "FAILURE", f"Token {token_id} expired or revoked")
        return {"valid": False, "reason": "Token expired or revoked"}
    
    log_audit("SYSTEM", "VALIDATE_CONSENT", "HEALTH_DATA", token[3], CURRENT_POLICY_MODE, "SUCCESS", f"Token {token_id} validated")
    return {"valid": True, "details": token}

# Care-Pair API
@app.post("/carepair/request")
async def request_carepair(req: CarePairRequest):
    request_id = str(uuid.uuid4())
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO care_pair_requests VALUES (?, ?, ?, ?, ?)",
              (request_id, req.patient_id, req.clinician_id, "PENDING", datetime.now().isoformat()))
    conn.commit()
    conn.close()
    
    log_audit(req.clinician_id, "CARE_PAIR_REQUEST", "ACCESS", "CARE", CURRENT_POLICY_MODE, "PENDING", f"Request {request_id}")
    return {"request_id": request_id}

@app.post("/carepair/approve")
async def approve_carepair(request_id: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE care_pair_requests SET status='APPROVED' WHERE request_id=?", (request_id,))
    conn.commit()
    conn.close()
    
    log_audit("PATIENT", "CARE_PAIR_APPROVE", "ACCESS", "CARE", CURRENT_POLICY_MODE, "SUCCESS", f"Request {request_id} approved")
    return {"status": "approved"}

# OTP API
@app.post("/otp/generate")
async def generate_otp(req: OTPRequest):
    import random
    code = str(random.randint(100000, 999999))
    expiry = (datetime.now() + timedelta(minutes=5)).isoformat()
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO otp_codes (user_id, code, expiry, is_verified) VALUES (?, ?, ?, 0)", (req.user_id, code, expiry))
    conn.commit()
    conn.close()
    
    log_audit(req.user_id, "GENERATE_OTP", "AUTH", "LOGIN", CURRENT_POLICY_MODE, "SUCCESS", f"OTP generated: {code}")
    return {"status": "sent", "code": code, "message": f"[SIMULATION] OTP sent to user {req.user_id}: {code}"}

@app.post("/otp/verify")
async def verify_otp(req: OTPVerify):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT code, expiry FROM otp_codes WHERE user_id=?", (req.user_id,))
    res = c.fetchone()
    
    if not res:
        conn.close()
        return {"valid": False, "reason": "No OTP found"}
    
    saved_code, expiry_str = res
    if datetime.now() > datetime.fromisoformat(expiry_str):
        conn.close()
        return {"valid": False, "reason": "OTP expired"}
    
    if saved_code == req.code:
        c.execute("UPDATE otp_codes SET is_verified=1 WHERE user_id=?", (req.user_id,))
        conn.commit()
        conn.close()
        log_audit(req.user_id, "VERIFY_OTP", "AUTH", "LOGIN", CURRENT_POLICY_MODE, "SUCCESS")
        return {"valid": True}
    else:
        conn.close()
        log_audit(req.user_id, "VERIFY_OTP", "AUTH", "LOGIN", CURRENT_POLICY_MODE, "FAILURE", "Incorrect code")
        return {"valid": False, "reason": "Incorrect code"}

# Data Access Gateway (Policy Enforcer)
@app.get("/data/vitals")
async def get_vitals(request: Request, patient_id: str, clinician_id: str, purpose: str, token_id: Optional[str] = None):
    start_time = time.time()
    
    # 1. Evaluate Policy Mode
    client_ip = request.client.host
    
    if CURRENT_POLICY_MODE == "ZERO_TRUST_MODE":
        # Privacy-First: Check if hashed client IP exists in Trusted Contexts
        import hashlib
        hashed_ip = hashlib.sha256(client_ip.encode()).hexdigest()
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT 1 FROM trusted_contexts WHERE context_value=? AND context_type='HASHED_IP'", (hashed_ip,))
        is_trusted = c.fetchone()
        conn.close()

        if not is_trusted:
            log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, CURRENT_POLICY_MODE, "DENIED", f"Zero Trust Privacy Violation: Hashed IP {hashed_ip[:10]}... is untrusted")
            raise HTTPException(status_code=403, detail="Zero Trust Violation: Untrusted Network Context")
            
        # Also require token
        if not token_id:
            log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, CURRENT_POLICY_MODE, "DENIED", "No token in Zero Trust")
            raise HTTPException(status_code=403, detail="Zero Trust: Token required")
            
    if CURRENT_POLICY_MODE == "CONSENT_MODE":
        if not token_id:
             log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, CURRENT_POLICY_MODE, "DENIED", "Consent required")
             raise HTTPException(status_code=403, detail="Consent Mode: Valid token required")

    if CURRENT_POLICY_MODE == "PASSWORD_OTP_MODE":
        # Check if OTP was verified for this clinician
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT is_verified FROM otp_codes WHERE user_id=?", (clinician_id,))
        res = c.fetchone()
        conn.close()
        if not res or not res[0]:
            log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, CURRENT_POLICY_MODE, "DENIED", "OTP verification required")
            raise HTTPException(status_code=403, detail="OTP Verification Required")
             
    # Validation if token provided
    if token_id:
        validation = await validate_consent(token_id)
        if not validation["valid"]:
            log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, CURRENT_POLICY_MODE, "DENIED", validation["reason"])
            raise HTTPException(status_code=403, detail=validation["reason"])

    # 2. Return Synthetic Data
    latency = (time.time() - start_time) * 1000 # ms
    log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, CURRENT_POLICY_MODE, "SUCCESS", f"Latency: {latency:.2f}ms")
    
    return {
        "status": "success",
        "data": {
            "hr": 72,
            "bp": "120/80",
            "spo2": 98,
            "timestamp": datetime.now().isoformat()
        },
        "metrics": {
            "latency_ms": latency,
            "policy_applied": CURRENT_POLICY_MODE
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
