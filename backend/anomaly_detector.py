import sqlite3
import time
from datetime import datetime, timedelta

DB_PATH = "rhms_audit.db"

class AnomalyDetector:
    def __init__(self):
        self.threshold_freq = 10 # requests per minute from same user
        
    def check_for_bursts(self):
        """Detects if a clinician is spamming data requests (Potential Data Exfiltration)"""
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # Look at last 1 minute of logs
        one_minute_ago = (datetime.now() - timedelta(minutes=1)).isoformat()
        c.execute("SELECT user_id, COUNT(*) FROM audit_logs WHERE action='ACCESS_DATA' AND status='SUCCESS' AND timestamp > ? GROUP BY user_id", (one_minute_ago,))
        results = c.fetchall()
        
        anomalies = []
        for user_id, count in results:
            if count > self.threshold_freq:
                anomalies.append({
                    "type": "EXFILTRATION_BURST",
                    "user_id": user_id,
                    "count": count,
                    "severity": "HIGH"
                })
        
        conn.close()
        return anomalies

    def check_purpose_mismatch(self):
        """Detects if access purpose doesn't align with policy (Heuristic)"""
        # Example: 'Marketing' purpose in a 'Research' mode
        pass

    def run_scan(self):
        print(f"[{datetime.now().isoformat()}] Running Security Scan...")
        bursts = self.check_for_bursts()
        if bursts:
            for b in bursts:
                print(f"!!! ANOMALY DETECTED: {b}")
        else:
            print("No anomalies detected.")

if __name__ == "__main__":
    detector = AnomalyDetector()
    while True:
        detector.run_scan()
        time.sleep(10) # Run every 10 seconds
