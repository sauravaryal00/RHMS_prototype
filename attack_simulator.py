import requests
import json
import time
import sys

# --- CONFIGURATION ---
SUPABASE_URL = "https://dbsnwlvfonemjhmajlbi.supabase.co"
SUPABASE_KEY = "sb_publishable_Qijy32ktt59tgIEzFHv2sA_tZ54kDmX"

def send_attack(name, type_key, risk, ip, ja3, payload):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    data = {
        "threat_name": name,
        "threat_type": type_key,
        "risk_score": risk,
        "source_ip": ip,
        "ja3_hash": ja3,
        "payload": payload
    }
    
    print(f"\n📡 [SENDING] {name} payload to Cloud Gateway...")
    try:
        res = requests.post(f"{SUPABASE_URL}/rest/v1/security_incidents", headers=headers, data=json.dumps(data))
        if res.status_code == 201:
            print(f"✅ [SUCCESS] Attack '{name}' is now LIVE on the dashboard!")
        else:
            print(f"❌ [FAILED] Status: {res.status_code}, Error: {res.text}")
    except Exception as e:
        print(f"❌ [ERROR] {str(e)}")

def menu():
    print("\n" + "="*50)
    print("      RHMS ZERO-TRUST HACKER CONSOLE (V2.0)")
    print("="*50)
    print("1. Brute Force Login (Credential Stuffing)")
    print("2. Foreign IP Access (Geo-Location Anomaly)")
    print("3. Expired Token Replay (JWT Exploitation)")
    print("4. Scope Creep (Horizontal Privilege Escalation)")
    print("5. Unregistered Device (Hardware Spoofing)")
    print("6. Cardiac Arrest Spike (IoT Medical Hijack)")
    print("0. Exit Console")
    print("="*50)
    
    choice = input("\nSelect Attack Vector [0-6]: ")
    
    if choice == '1':
        send_attack("Brute Force Login", "auth_brute", 8.8, "185.15.22.1", "e1f1c2d3b4a5968778a9b0c1d2e3f4a5", {"attempt_user": "admin", "wordlist": "rockyou.txt"})
    elif choice == '2':
        send_attack("Foreign IP Access", "geo_anomaly", 9.2, "103.22.201.25", "a1b2c3d4e5f607182930a1b2c3d4e5f6", {"proxy": "Tor Exit Node", "origin": "Moscow, RU"})
    elif choice == '3':
        send_attack("Expired Token Replay", "token_replay", 7.5, "45.33.2.145", "99887766554433221100aabbccddeeff", {"token_id": "JWT_EXP_2024", "action": "vitals_read"})
    elif choice == '4':
        send_attack("Scope Creep", "scope_creep", 8.4, "194.187.249.12", "fefefefefefefefefefefefefefefefe", {"requested_scope": "clinical_records", "granted": "none"})
    elif choice == '5':
        send_attack("Unregistered Device", "device_anomaly", 7.1, "111.90.150.2", "deadbeefdeadbeefdeadbeefdeadbeef", {"fingerprint": "Kali-Linux-Attacker", "os": "Unknown"})
    elif choice == '6':
        send_attack("Cardiac Arrest Spike", "clinical_spike", 9.9, "10.0.42.168", "00000000000000000000000000000000", {"hr": 195, "spo2": 82, "temp": 104.5})
    elif choice == '0':
        print("Exiting Hacker Console...")
        sys.exit()
    else:
        print("Invalid choice, try again.")

if __name__ == "__main__":
    while True:
        menu()
        time.sleep(1)
