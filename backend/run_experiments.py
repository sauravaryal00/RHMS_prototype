import requests
import time
import csv
import concurrent.futures
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def run_test_case(name, mode, patient_id, clinician_id, purpose, token_id=None, num_requests=100):
    print(f"--- Running Test Case: {name} (Mode: {mode}) ---")
    
    # Set policy mode
    requests.post(f"{BASE_URL}/system/policy?mode={mode}")
    
    latencies = []
    success_count = 0
    failure_count = 0
    
    def single_request():
        start = time.time()
        try:
            params = {
                "patient_id": patient_id,
                "clinician_id": clinician_id,
                "purpose": purpose
            }
            if token_id:
                params["token_id"] = token_id
                
            resp = requests.get(f"{BASE_URL}/data/vitals", params=params, timeout=5)
            latency = (time.time() - start) * 1000 # ms
            return resp.status_code, latency
        except Exception as e:
            return 500, (time.time() - start) * 1000

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(single_request) for _ in range(num_requests)]
        for future in concurrent.futures.as_completed(futures):
            status, lat = future.result()
            latencies.append(lat)
            if status == 200:
                success_count += 1
            else:
                failure_count += 1

    avg_latency = sum(latencies) / len(latencies) if latencies else 0
    p95_latency = sorted(latencies)[int(0.95 * len(latencies))] if latencies else 0
    
    return {
        "test_name": name,
        "mode": mode,
        "requests": num_requests,
        "success": success_count,
        "failure": failure_count,
        "avg_latency_ms": round(avg_latency, 2),
        "p95_latency_ms": round(p95_latency, 2),
        "timestamp": datetime.now().isoformat()
    }

def export_audit_logs():
    import sqlite3
    import csv
    conn = sqlite3.connect("rhms_audit.db")
    c = conn.cursor()
    c.execute("SELECT * FROM audit_logs")
    rows = c.fetchall()
    colnames = [description[0] for description in c.description]
    
    with open('audit_log_dump.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(colnames)
        writer.writerows(rows)
    conn.close()
    print("[SUCCESS] 'audit_log_dump.csv' generated from SQLite.")

def main():
    # 1. Setup: Issue a token first
    print("Initializing Experiment...")
    resp = requests.post(f"{BASE_URL}/consent/issue", json={
        "patient_id": "P001",
        "clinician_id": "D007",
        "purpose": "Routine Checkup",
        "duration_minutes": 60
    })
    token_id = resp.json().get("token_id")
    print(f"Token Issued: {token_id}")

    results = []

    # Scenario A: Baseline Performance (Consent Mode vs Logging Only)
    results.append(run_test_case("Normal Access", "CONSENT_MODE", "P001", "D007", "Checkup", token_id, 50))
    results.append(run_test_case("No-Policy Baseline", "LOGGING_ONLY_MODE", "P001", "D007", "Checkup", None, 50))
    
    # Scenario B: OTP Mode Verification
    print("\n--- Testing OTP Mode ---")
    clinician_id = "D007"
    # 1. Generate OTP
    resp = requests.post(f"{BASE_URL}/otp/generate", json={"user_id": clinician_id})
    otp_code = resp.json().get("code")
    print(f"OTP Generated: {otp_code}")
    
    # 2. Access before verify (Should Fail)
    results.append(run_test_case("OTP Mode (Unverified)", "PASSWORD_OTP_MODE", "P001", clinician_id, "Checkup", None, 10))
    
    # 3. Verify OTP
    requests.post(f"{BASE_URL}/otp/verify", json={"user_id": clinician_id, "code": otp_code})
    print("OTP Verified.")
    
    # 4. Access after verify (Should Pass)
    results.append(run_test_case("OTP Mode (Verified)", "PASSWORD_OTP_MODE", "P001", clinician_id, "Checkup", None, 10))

    # Scenario C: Security Pressure (Zero Trust Mode)
    results.append(run_test_case("Strict Security", "ZERO_TRUST_MODE", "P001", "D007", "Checkup", token_id, 50))
    
    # Scenario C: Attack Simulation (Revoked Token)
    requests.post(f"{BASE_URL}/consent/revoke?token_id={token_id}")
    results.append(run_test_case("Revoked Access Attempt", "CONSENT_MODE", "P001", "D007", "Checkup", token_id, 20))

    # Save to CSV
    keys = results[0].keys()
    with open('thesis_metrics_results.csv', 'w', newline='') as output_file:
        dict_writer = csv.DictWriter(output_file, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(results)
    
    print("\n[SUCCESS] Experiments completed. 'thesis_metrics_results.csv' generated.")
    export_audit_logs()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}. Is the server running at {BASE_URL}?")
