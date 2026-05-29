import time
import json
import uuid
import hashlib
import os
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=".env.local")

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Supabase credentials missing in .env.local")
    # Fallback to hardcoded if necessary for demo, but better to use env
    SUPABASE_URL = "https://dbsnwlvfonemjhmajlbi.supabase.co"
    SUPABASE_KEY = "sb_publishable_Qijy32ktt59tgIEzFHv2sA_tZ54kDmX"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="RHMS Cloud-Ready Backend")

# Models
class ConsentRequest(BaseModel):
    patient_id: str
    clinician_id: str
    clinician_role: str = "Doctor"
    purpose: str
    scope: List[str] = ["Heart Rate", "Blood Pressure", "Oxygen Levels"]
    duration_minutes: int = 60

class CarePairRequest(BaseModel):
    patient_id: str
    clinician_id: str

class OTPRequest(BaseModel):
    user_id: str

class OTPVerify(BaseModel):
    user_id: str
    code: str

# Audit Logger (Now writes to Supabase)
def log_audit(user_id, action, resource, purpose, policy_mode, status, details=""):
    try:
        # Simple hash-chain simulation for thesis
        entry_hash = hashlib.sha256(f"{datetime.now().isoformat()}{user_id}{action}".encode()).hexdigest()
        
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "purpose": purpose,
            "policy_mode": policy_mode,
            "status": status,
            "details": details,
            "entry_hash": entry_hash
        }
        supabase.table("audit_logs").insert(log_entry).execute()
    except Exception as e:
        print(f"Audit Log Error: {e}")

# Global State for Policy
CURRENT_POLICY_MODE = "CONSENT_MODE"

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
    start_time = time.time()
    latency_ms = round((time.time() - start_time) * 1000, 3)
    return {"mode": CURRENT_POLICY_MODE, "latency_ms": latency_ms}

@app.post("/system/policy")
async def update_policy(data: dict):
    start_time = time.time()
    global CURRENT_POLICY_MODE
    new_mode = data.get("mode")
    new_ip = data.get("allowed_ip")
    
    if new_mode in ["CONSENT_MODE", "PASSWORD_OTP_MODE", "LOGGING_ONLY_MODE", "ZERO_TRUST_MODE"]:
        CURRENT_POLICY_MODE = new_mode
        if new_ip:
            hashed_ip = hashlib.sha256(new_ip.encode()).hexdigest()
            supabase.table("trusted_contexts").upsert({
                "entity_id": "ADMIN_OVERRIDE",
                "context_type": "HASHED_IP",
                "context_value": hashed_ip
            }).execute()
        latency_ms = round((time.time() - start_time) * 1000, 3)
        return {"status": "success", "mode": CURRENT_POLICY_MODE, "latency_ms": latency_ms}
    latency_ms = round((time.time() - start_time) * 1000, 3)
    return {"status": "error", "message": "Invalid mode", "latency_ms": latency_ms}

# Consent API
@app.post("/consent/issue")
async def issue_consent(req: ConsentRequest):
    start_time = time.time()
    token_id = f"tok_{uuid.uuid4()}"
    issued_at = datetime.now().isoformat()
    expires_at = (datetime.now() + timedelta(minutes=req.duration_minutes)).isoformat()
    signature = hashlib.sha256(f"{token_id}{req.patient_id}{req.clinician_id}".encode()).hexdigest()[:16]
    
    data = {
        "token_id": token_id,
        "patient_id": req.patient_id,
        "clinician_id": req.clinician_id,
        "clinician_role": req.clinician_role,
        "purpose": req.purpose,
        "scope": req.scope,
        "issued_at": issued_at,
        "expires_at": expires_at,
        "revoked": False,
        "signature": signature
    }
    supabase.table("consent_tokens").insert(data).execute()
    
    log_audit(req.patient_id, "ISSUE_CONSENT", "HEALTH_DATA", req.purpose, CURRENT_POLICY_MODE, "SUCCESS", f"Token {token_id} issued")
    latency_ms = round((time.time() - start_time) * 1000, 3)
    return {"token_id": token_id, "expires_at": expires_at, "latency_ms": latency_ms}

@app.post("/consent/revoke")
async def revoke_consent(token_id: str):
    start_time = time.time()
    supabase.table("consent_tokens").update({"revoked": True}).eq("token_id", token_id).execute()
    log_audit("SYSTEM", "REVOKE_CONSENT", "HEALTH_DATA", "N/A", CURRENT_POLICY_MODE, "SUCCESS", f"Token {token_id} revoked")
    latency_ms = round((time.time() - start_time) * 1000, 3)
    return {"status": "revoked", "latency_ms": latency_ms}

@app.get("/consent/validate/{token_id}")
async def validate_consent(token_id: str):
    start_time = time.time()
    res = supabase.table("consent_tokens").select("*").eq("token_id", token_id).execute()
    token = res.data[0] if res.data else None
    
    if not token:
        log_audit("SYSTEM", "VALIDATE_CONSENT", "HEALTH_DATA", "N/A", CURRENT_POLICY_MODE, "FAILURE", f"Invalid token {token_id}")
        latency_ms = round((time.time() - start_time) * 1000, 3)
        return {"valid": False, "reason": "Invalid token", "latency_ms": latency_ms}
    
    expiry = datetime.fromisoformat(token['expires_at'].replace("Z", "+00:00"))
    if datetime.now(expiry.tzinfo) > expiry or token.get('revoked', False):
        log_audit("SYSTEM", "VALIDATE_CONSENT", "HEALTH_DATA", token['purpose'], CURRENT_POLICY_MODE, "FAILURE", f"Token {token_id} expired/revoked")
        latency_ms = round((time.time() - start_time) * 1000, 3)
        return {"valid": False, "reason": "Token expired or revoked", "latency_ms": latency_ms}
    
    log_audit("SYSTEM", "VALIDATE_CONSENT", "HEALTH_DATA", token['purpose'], CURRENT_POLICY_MODE, "SUCCESS", f"Token {token_id} validated")
    latency_ms = round((time.time() - start_time) * 1000, 3)
    return {"valid": True, "details": token, "latency_ms": latency_ms}

# OTP API
@app.post("/otp/generate")
async def generate_otp(req: OTPRequest):
    start_time = time.time()
    import random
    code = str(random.randint(100000, 999999))
    expiry = (datetime.now() + timedelta(minutes=5)).isoformat()
    
    supabase.table("otp_codes").upsert({
        "user_id": req.user_id,
        "code": code,
        "expiry": expiry,
        "is_verified": False
    }).execute()
    
    log_audit(req.user_id, "GENERATE_OTP", "AUTH", "LOGIN", CURRENT_POLICY_MODE, "SUCCESS", f"OTP generated: {code}")
    latency_ms = round((time.time() - start_time) * 1000, 3)
    return {"status": "sent", "code": code, "message": f"[SIMULATION] OTP sent: {code}", "latency_ms": latency_ms}

@app.post("/otp/verify")
async def verify_otp(req: OTPVerify):
    start_time = time.time()
    res = supabase.table("otp_codes").select("*").eq("user_id", req.user_id).execute()
    data = res.data[0] if res.data else None
    
    if not data: 
        latency_ms = round((time.time() - start_time) * 1000, 3)
        return {"valid": False, "reason": "No OTP found", "latency_ms": latency_ms}
    
    if datetime.now() > datetime.fromisoformat(data['expiry']):
        latency_ms = round((time.time() - start_time) * 1000, 3)
        return {"valid": False, "reason": "OTP expired", "latency_ms": latency_ms}
    
    if data['code'] == req.code:
        supabase.table("otp_codes").update({"is_verified": True}).eq("user_id", req.user_id).execute()
        log_audit(req.user_id, "VERIFY_OTP", "AUTH", "LOGIN", CURRENT_POLICY_MODE, "SUCCESS")
        latency_ms = round((time.time() - start_time) * 1000, 3)
        return {"valid": True, "latency_ms": latency_ms}
    else:
        log_audit(req.user_id, "VERIFY_OTP", "AUTH", "LOGIN", CURRENT_POLICY_MODE, "FAILURE", "Incorrect code")
        latency_ms = round((time.time() - start_time) * 1000, 3)
        return {"valid": False, "reason": "Incorrect code", "latency_ms": latency_ms}

# Data Access Gateway
@app.get("/data/vitals")
async def get_vitals(request: Request, patient_id: str, clinician_id: str, purpose: str, token_id: Optional[str] = None):
    start_time = time.time()
    client_ip = request.client.host
    
    if CURRENT_POLICY_MODE == "ZERO_TRUST_MODE":
        # Privacy-First: Check hashed IP in Supabase
        hashed_ip = hashlib.sha256(client_ip.encode()).hexdigest()
        res = supabase.table("trusted_contexts").select("*").eq("context_value", hashed_ip).eq("context_type", "HASHED_IP").execute()
        
        if not res.data:
            log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, CURRENT_POLICY_MODE, "DENIED", f"ZT Violation: Hashed IP {hashed_ip[:10]}...")
            raise HTTPException(status_code=403, detail=f"Zero Trust Violation: Untrusted Context")
            
        if not token_id:
            log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, CURRENT_POLICY_MODE, "DENIED", "No token in Zero Trust")
            raise HTTPException(status_code=403, detail="Zero Trust: Token required")
            
    if CURRENT_POLICY_MODE == "CONSENT_MODE" and not token_id:
        raise HTTPException(status_code=403, detail="Consent Mode: Valid token required")

    if token_id:
        validation = await validate_consent(token_id)
        if not validation["valid"]:
            raise HTTPException(status_code=403, detail=validation["reason"])

    # Query latest vitals from Supabase for this patient
    hr, bp, spo2, timestamp = 72, "120/80", 98, datetime.now().isoformat()
    try:
        res = supabase.table("vitals").select("*").eq("patient_id", patient_id).order("timestamp", desc=True).limit(1).execute()
        if res.data:
            v = res.data[0]
            hr = v.get("hr", 72)
            bp_sys = int(v.get("bp_sys", 120))
            bp_dia = int(v.get("bp_dia", 80))
            bp = f"{bp_sys}/{bp_dia}"
            spo2 = v.get("spo2", 98)
            timestamp = v.get("timestamp", datetime.now().isoformat())
    except Exception as e:
        print("Error fetching vitals from Supabase:", e)

    latency = (time.time() - start_time) * 1000
    log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, CURRENT_POLICY_MODE, "SUCCESS", f"Latency: {latency:.2f}ms")
    
    return {
        "status": "success",
        "data": {"hr": hr, "bp": bp, "spo2": spo2, "timestamp": timestamp},
        "metrics": {"latency_ms": latency, "policy_applied": CURRENT_POLICY_MODE}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
