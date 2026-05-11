import requests
import time
import random
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def simulate_device():
    print("Starting IoT Device Simulation (Heart Rate & SPO2)...")
    patient_id = "P001"
    clinician_id = "D007"
    purpose = "Remote Monitoring"
    
    # In a real scenario, the device might have a long-lived token or use a gateway
    # For simulation, we'll assume it has a valid token
    resp = requests.post(f"{BASE_URL}/consent/issue", json={
        "patient_id": patient_id,
        "clinician_id": clinician_id,
        "purpose": purpose,
        "duration_minutes": 1440 # 24 hours
    })
    token_id = resp.json().get("token_id")
    print(f"Device authenticated. Token: {token_id}")

    try:
        while True:
            hr = random.randint(65, 95)
            spo2 = random.randint(95, 99)
            
            # Simulate publishing data via the Policy Gateway
            # (Note: In this prototype, devices push data to the server or server pulls)
            # We'll simulate a pull/push log entry
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Pushing Vitals -> HR: {hr}, SpO2: {spo2}")
            
            # Check if still authorized
            resp = requests.get(f"{BASE_URL}/data/vitals", params={
                "patient_id": patient_id,
                "clinician_id": clinician_id,
                "purpose": purpose,
                "token_id": token_id
            })
            
            if resp.status_code != 200:
                print(f"!!! ACCESS DENIED: {resp.json().get('detail')}")
                break
                
            time.sleep(5)
    except KeyboardInterrupt:
        print("Simulation stopped.")

if __name__ == "__main__":
    simulate_device()
