"""
RHMS Local Experiment Server
Uses SQLite locally — no Supabase needed.
Runs on port 8001 so it doesn't conflict with existing server.
"""
import time, json, uuid, hashlib, sqlite3, os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel

DB = "rhms_local_experiment.db"

# ─── DB Setup ─────────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS consent_tokens (
            token_id TEXT PRIMARY KEY,
            patient_id TEXT,
            clinician_id TEXT,
            purpose TEXT,
            expiry TEXT,
            status TEXT DEFAULT 'ACTIVE',
            scope TEXT DEFAULT 'heart_rate,blood_pressure,spo2'
        );
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            user_id TEXT,
            action TEXT,
            resource TEXT,
            purpose TEXT,
            policy_mode TEXT,
            status TEXT,
            details TEXT,
            entry_hash TEXT
        );
        CREATE TABLE IF NOT EXISTS otp_codes (
            user_id TEXT PRIMARY KEY,
            code TEXT,
            expiry TEXT,
            is_verified INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS trusted_contexts (
            entity_id TEXT,
            context_type TEXT,
            context_value TEXT
        );
        CREATE TABLE IF NOT EXISTS vitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT,
            timestamp TEXT,
            hr REAL,
            bp_sys REAL,
            bp_dia REAL,
            spo2 REAL,
            temp REAL,
            resp REAL,
            glucose REAL
        );
    """)
    conn.commit()

    # Seed local vitals from CSV if table is empty
    count = conn.execute("SELECT COUNT(*) FROM vitals").fetchone()[0]
    if count == 0:
        print("Seeding local SQLite database from Kaggle CSV...")
        import csv, random
        csv_path = "healthcare_iot_target_dataset.csv"
        # Check parent folder if running from different subdirectory
        if not os.path.exists(csv_path):
            csv_path = os.path.join("..", csv_path)
            
        if os.path.exists(csv_path):
            records = []
            with open(csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    try:
                        raw_pid = row.get("Patient_ID")
                        if not raw_pid:
                            continue
                        
                        raw_ts = row.get("Timestamp")
                        try:
                            ts = datetime.strptime(raw_ts, "%Y-%m-%d %H:%M:%S").isoformat()
                        except:
                            ts = datetime.now().isoformat()
                            
                        temp_c = float(row.get("Temperature (°C)", 37.0))
                        temp_f = round((temp_c * 9 / 5) + 32, 1)
                        
                        bp_sys = float(row.get("Systolic_BP (mmHg)", 120))
                        bp_dia = float(row.get("Diastolic_BP (mmHg)", 80))
                        hr = float(row.get("Heart_Rate (bpm)", 72))
                        
                        status = row.get("Target_Health_Status", "Healthy")
                        if status == "Healthy":
                            spo2 = round(random.uniform(96.5, 99.8), 1)
                        else:
                            spo2 = round(random.uniform(89.5, 95.8), 1)
                            
                        resp = random.randint(14, 20)
                        glucose = random.randint(85, 125)
                        
                        # Add specific patient
                        records.append((f"patient-{raw_pid}", ts, hr, bp_sys, bp_dia, spo2, temp_f, resp, glucose))
                        
                        # Also duplicate for 8270
                        records.append(("8270", ts, hr, bp_sys, bp_dia, spo2, temp_f, resp, glucose))
                    except Exception as e:
                        pass
            
            if records:
                conn.executemany("""
                    INSERT INTO vitals (patient_id, timestamp, hr, bp_sys, bp_dia, spo2, temp, resp, glucose)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, records)
                conn.commit()
                print(f"Local SQLite seeded with {len(records)} vitals records.")
        else:
            print("Warning: CSV file not found for local seeding.")
            
    conn.close()

init_db()

app = FastAPI(title="RHMS Local Experiment Server")
POLICY_MODE = {"mode": "CONSENT_MODE"}

# ─── Models ───────────────────────────────────────────────────────────────────
class ConsentRequest(BaseModel):
    patient_id: str
    clinician_id: str
    purpose: str
    duration_minutes: int = 60
    scope: str = "heart_rate,blood_pressure,spo2"

class OTPRequest(BaseModel):
    user_id: str

class OTPVerify(BaseModel):
    user_id: str
    code: str

# ─── Audit ────────────────────────────────────────────────────────────────────
def log_audit(user_id, action, resource, purpose, policy_mode, status, details=""):
    entry_hash = hashlib.sha256(
        f"{datetime.now().isoformat()}{user_id}{action}".encode()
    ).hexdigest()
    conn = get_db()
    conn.execute(
        "INSERT INTO audit_logs (timestamp,user_id,action,resource,purpose,policy_mode,status,details,entry_hash) VALUES (?,?,?,?,?,?,?,?,?)",
        (datetime.now().isoformat(), user_id, action, resource, purpose, policy_mode, status, details, entry_hash)
    )
    conn.commit()
    conn.close()

# ─── Policy ───────────────────────────────────────────────────────────────────
@app.get("/system/policy")
def get_policy():
    return POLICY_MODE

@app.post("/system/policy")
def set_policy(data: dict):
    mode = data.get("mode", "")
    valid = ["CONSENT_MODE","PASSWORD_OTP_MODE","LOGGING_ONLY_MODE","ZERO_TRUST_MODE"]
    if mode in valid:
        POLICY_MODE["mode"] = mode
        return {"status": "ok", "mode": mode}
    return {"status": "error"}

@app.get("/system/audit_count")
def audit_count():
    conn = get_db()
    n = conn.execute("SELECT COUNT(*) FROM audit_logs").fetchone()[0]
    conn.close()
    return {"count": n}

# ─── Consent ──────────────────────────────────────────────────────────────────
@app.post("/consent/issue")
def issue_consent(req: ConsentRequest):
    token_id = str(uuid.uuid4())
    expiry = (datetime.now() + timedelta(minutes=req.duration_minutes)).isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO consent_tokens (token_id,patient_id,clinician_id,purpose,expiry,status,scope) VALUES (?,?,?,?,?,?,?)",
        (token_id, req.patient_id, req.clinician_id, req.purpose, expiry, "ACTIVE", req.scope)
    )
    conn.commit()
    conn.close()
    log_audit(req.patient_id, "ISSUE_CONSENT", "HEALTH_DATA", req.purpose, POLICY_MODE["mode"], "SUCCESS", f"token={token_id[:8]}")
    return {"token_id": token_id, "expiry": expiry}

@app.post("/consent/revoke")
def revoke_consent(token_id: str):
    conn = get_db()
    conn.execute("UPDATE consent_tokens SET status='REVOKED' WHERE token_id=?", (token_id,))
    conn.commit()
    conn.close()
    log_audit("SYSTEM", "REVOKE_CONSENT", "HEALTH_DATA", "N/A", POLICY_MODE["mode"], "SUCCESS", f"token={token_id[:8]}")
    return {"status": "revoked"}

@app.get("/consent/validate/{token_id}")
def validate_consent(token_id: str, purpose: Optional[str] = None):
    conn = get_db()
    row = conn.execute("SELECT * FROM consent_tokens WHERE token_id=?", (token_id,)).fetchone()
    conn.close()

    if not row:
        log_audit("SYSTEM", "VALIDATE", "HEALTH_DATA", "N/A", POLICY_MODE["mode"], "FAILURE", "invalid token")
        raise HTTPException(status_code=403, detail="Invalid token")

    expiry = datetime.fromisoformat(row["expiry"])
    if datetime.now() > expiry:
        log_audit("SYSTEM", "VALIDATE", "HEALTH_DATA", row["purpose"], POLICY_MODE["mode"], "FAILURE", "expired")
        raise HTTPException(status_code=403, detail="Token expired")

    if row["status"] != "ACTIVE":
        log_audit("SYSTEM", "VALIDATE", "HEALTH_DATA", row["purpose"], POLICY_MODE["mode"], "FAILURE", "revoked")
        raise HTTPException(status_code=403, detail="Token revoked")

    # Purpose mismatch check
    if purpose and purpose != row["purpose"]:
        log_audit("SYSTEM", "VALIDATE", "HEALTH_DATA", purpose, POLICY_MODE["mode"], "FAILURE", f"purpose mismatch: {purpose} vs {row['purpose']}")
        raise HTTPException(status_code=403, detail="Purpose mismatch")

    log_audit("SYSTEM", "VALIDATE", "HEALTH_DATA", row["purpose"], POLICY_MODE["mode"], "SUCCESS")
    return {"valid": True, "token_id": token_id, "purpose": row["purpose"], "scope": row["scope"]}

# ─── Data Gateway ─────────────────────────────────────────────────────────────
@app.get("/data/vitals")
def get_vitals(request: Request, patient_id: str, clinician_id: str,
               purpose: str, token_id: Optional[str] = None,
               fields: Optional[str] = None):
    t0 = time.perf_counter()
    mode = POLICY_MODE["mode"]

    # ZERO_TRUST: block untrusted IPs (no IP whitelisted in tests)
    if mode == "ZERO_TRUST_MODE":
        client_ip = request.client.host
        hashed = hashlib.sha256(client_ip.encode()).hexdigest()
        conn = get_db()
        row = conn.execute("SELECT * FROM trusted_contexts WHERE context_value=? AND context_type='HASHED_IP'", (hashed,)).fetchone()
        conn.close()
        if not row:
            log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, mode, "DENIED", "ZT: untrusted IP")
            raise HTTPException(status_code=403, detail="Zero Trust: Untrusted context")

    # CONSENT_MODE: token required
    if mode == "CONSENT_MODE" and not token_id:
        log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, mode, "DENIED", "no token")
        raise HTTPException(status_code=403, detail="Token required")

    # Validate token if present
    if token_id:
        conn = get_db()
        row = conn.execute("SELECT * FROM consent_tokens WHERE token_id=?", (token_id,)).fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=403, detail="Invalid token")
        if datetime.now() > datetime.fromisoformat(row["expiry"]):
            raise HTTPException(status_code=403, detail="Token expired")
        if row["status"] != "ACTIVE":
            raise HTTPException(status_code=403, detail="Token revoked")
        # Purpose check
        if purpose and purpose not in ("N/A", row["purpose"]) and mode == "CONSENT_MODE":
            raise HTTPException(status_code=403, detail="Purpose mismatch")
        # Scope check
        approved_fields = set(row["scope"].split(","))
        if fields:
            requested = set(fields.split(","))
            if not requested.issubset(approved_fields):
                raise HTTPException(status_code=403, detail="Scope violation")

    # Fetch from SQLite database
    conn = get_db()
    row = conn.execute("SELECT * FROM vitals WHERE patient_id=? ORDER BY timestamp DESC LIMIT 1", (patient_id,)).fetchone()
    conn.close()
    if row:
        hr = row["hr"]
        bp_sys = int(row["bp_sys"])
        bp_dia = int(row["bp_dia"])
        bp = f"{bp_sys}/{bp_dia}"
        spo2 = row["spo2"]
        temp = row["temp"]
        glucose = row["glucose"]
        timestamp = row["timestamp"]
    else:
        hr, bp, spo2, temp, glucose, timestamp = 72, "120/80", 98, 98.6, 95, datetime.now().isoformat()

    latency_ms = (time.perf_counter() - t0) * 1000
    log_audit(clinician_id, "ACCESS_DATA", "VITALS", purpose, mode, "SUCCESS", f"{latency_ms:.2f}ms")
    return {
        "status": "success",
        "data": {
            "hr": hr,
            "bp": bp,
            "spo2": spo2,
            "timestamp": timestamp,
            "heart_rate": hr,
            "blood_pressure": bp,
            "temperature": temp,
            "glucose": glucose
        },
        "latency_ms": latency_ms,
        "policy": mode
    }

# ─── OTP ──────────────────────────────────────────────────────────────────────
@app.post("/otp/generate")
def generate_otp(req: OTPRequest):
    import random
    code = str(random.randint(100000, 999999))
    expiry = (datetime.now() + timedelta(minutes=5)).isoformat()
    conn = get_db()
    conn.execute("INSERT OR REPLACE INTO otp_codes VALUES (?,?,?,0)", (req.user_id, code, expiry))
    conn.commit()
    conn.close()
    return {"code": code, "status": "sent"}

@app.post("/otp/verify")
def verify_otp(req: OTPVerify):
    conn = get_db()
    row = conn.execute("SELECT * FROM otp_codes WHERE user_id=?", (req.user_id,)).fetchone()
    conn.close()
    if not row:
        return {"valid": False}
    if datetime.now() > datetime.fromisoformat(row["expiry"]):
        return {"valid": False, "reason": "expired"}
    if row["code"] == req.code:
        conn = get_db()
        conn.execute("UPDATE otp_codes SET is_verified=1 WHERE user_id=?", (req.user_id,))
        conn.commit()
        conn.close()
        return {"valid": True}
    return {"valid": False, "reason": "wrong code"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
