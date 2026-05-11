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
    return {"mode": CURRENT_POLICY_MODE}

@app.post("/system/policy")
async def update_policy(data: dict):
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
        return {"status": "success", "mode": CURRENT_POLICY_MODE}
    return {"status": "error", "message": "Invalid mode"}

# Consent API
@app.post("/consent/issue")
async def issue_consent(req: ConsentRequest):
    token_id = str(uuid.uuid4())
    expiry = (datetime.now() + timedelta(minutes=req.duration_minutes)).isoformat()
    
    data = {
        "token_id": token_id,
        "patient_id": req.patient_id,
        "clinician_id": req.clinician_id,
        "purpose": req.purpose,
        "expiry": expiry,
        "status": "ACTIVE"
    }
    supabase.table("consent_tokens").insert(data).execute()
    
    log_audit(req.patient_id, "ISSUE_CONSENT", "HEALTH_DATA", req.purpose, CURRENT_POLICY_MODE, "SUCCESS", f"Token {token_id} issued")
    return {"token_id": token_id, "expiry": expiry}

@app.post("/consent/revoke")
async def revoke_consent(token_id: str):
    supabase.table("consent_tokens").update({"status": "REVOKED"}).eq("token_id", token_id).execute()
    log_audit("SYSTEM", "REVOKE_CONSENT", "HEALTH_DATA", "N/A", CURRENT_POLICY_MODE, "SUCCESS", f"Token {token_id} revoked")
    return {"status": "revoked"}

@app.get("/consent/validate/{token_id}")
async def validate_consent(token_id: str):
    res = supabase.table("consent_tokens").select("*").eq("token_id", token_id).execute()
    token = res.data[0] if res.data else None
    
    if not token:
        log_audit("SYSTEM", "VALIDATE_CONSENT", "HEALTH_DATA", "N/A", CURRENT_POLICY_MODE, "FAILURE", f"Invalid token {token_id}")
        return {"valid": False, "reason": "Invalid token"}
    
    expiry = datetime.fromisoformat(token['expiry'])
    if datetime.now() > expiry or token['status'] != "ACTIVE":
        log_audit("SYSTEM", "VALIDATE_CONSENT", "HEALTH_DATA", token['purpose'], CURRENT_POLICY_MODE, "FAILURE", f"Token {token_id} expired/revoked")
        return {"valid": False, "reason": "Token expired or revoked"}
    
    log_audit("SYSTEM", "VALIDATE_CONSENT", "HEALTH_DATA", token['purpose'], CURRENT_POLICY_MODE, "SUCCESS", f"Token {token_id} validated")
    return {"valid": True, "details": token}

# OTP API
@app.post("/otp/generate")
async def generate_otp(req: OTPRequest):
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
    return {"status": "sent", "code": code, "message": f"[SIMULATION] OTP sent: {code}"}

@app.post("/otp/verify")
async def verify_otp(req: OTPVerify):
    res = supabase.table("otp_codes").select("*").eq("user_id", req.user_id).execute()
    data = res.data[0] if res.data else None
    
    if not data: return {"valid": False, "reason": "No OTP found"}
    
    if datetime.now() > datetime.fromisoformat(data['expiry']):
        return {"valid": False, "reason": "OTP expired"}
    
    if data['code'] == req.code:
        supabase.table("otp_codes").update({"is_verified": True}).eq("user_id", req.user_id).execute()
        log_audit(req.user_id, "VERIFY_OTP", "AUTH", "LOGIN", CURRENT_POLICY_MODE, "SUCCESS")
        return {"valid": True}
    else:
        log_audit(req.user_id, "VERIFY_OTP", "AUTH", "LOGIN", CURRENT_POLICY_MODE, "FAILURE", "Incorrect code")
        return {"valid": False, "reason": "Incorrect code"}

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

    latency = (time.time() - start_time) * 1000
    log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, CURRENT_POLICY_MODE, "SUCCESS", f"Latency: {latency:.2f}ms")
    
    return {
        "status": "success",
        "data": {"hr": 72, "bp": "120/80", "spo2": 98, "timestamp": datetime.now().isoformat()},
        "metrics": {"latency_ms": latency, "policy_applied": CURRENT_POLICY_MODE}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
