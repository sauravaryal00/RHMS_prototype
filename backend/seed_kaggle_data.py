import os
import csv
import random
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load Supabase config
load_dotenv(dotenv_path=".env.local")
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Supabase URL or Anon Key is missing from .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

CSV_PATH = "healthcare_iot_target_dataset.csv"

def seed_data():
    print(f"Reading Kaggle dataset from {CSV_PATH}...")
    if not os.path.exists(CSV_PATH):
        # Check in parent directory
        CSV_PATH_ALT = os.path.join("..", CSV_PATH)
        if os.path.exists(CSV_PATH_ALT):
            csv_file_path = CSV_PATH_ALT
        else:
            print(f"ERROR: CSV file not found at {CSV_PATH}")
            return
    else:
        csv_file_path = CSV_PATH

    records = []
    
    with open(csv_file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                raw_pid = row.get("Patient_ID")
                if not raw_pid:
                    continue
                
                # Parse timestamp
                raw_ts = row.get("Timestamp")
                try:
                    ts = datetime.strptime(raw_ts, "%Y-%m-%d %H:%M:%S").isoformat() + "+00:00"
                except:
                    ts = datetime.now().isoformat()
                
                # Parse parameters
                temp_c = float(row.get("Temperature (°C)", 37.0))
                temp_f = round((temp_c * 9 / 5) + 32, 1)  # Convert to Fahrenheit for dashboard
                
                bp_sys = float(row.get("Systolic_BP (mmHg)", 120))
                bp_dia = float(row.get("Diastolic_BP (mmHg)", 80))
                hr = float(row.get("Heart_Rate (bpm)", 72))
                
                # Check status to generate a realistic SpO2 level
                status = row.get("Target_Health_Status", "Healthy")
                if status == "Healthy":
                    spo2 = round(random.uniform(96.5, 99.8), 1)
                else:
                    spo2 = round(random.uniform(89.5, 95.8), 1)
                
                # Synthesize other standard vitals fields
                resp = random.randint(14, 20)
                glucose = random.randint(85, 125)
                
                # Create base record for actual patient ID
                record = {
                    "patient_id": f"patient-{raw_pid}",
                    "timestamp": ts,
                    "hr": hr,
                    "bp_sys": bp_sys,
                    "bp_dia": bp_dia,
                    "spo2": spo2,
                    "temp": temp_f,
                    "resp": resp,
                    "glucose": glucose
                }
                records.append(record)
                
                # Also create a duplicate record for demo 8270 to provide continuous demo data
                record_demo = record.copy()
                record_demo["patient_id"] = "8270"
                records.append(record_demo)
                
            except Exception as e:
                print(f"Skipping row due to error: {e}")

    print(f"Total processed records to insert: {len(records)}")

    # Clear previous entries for 8270 to keep database clean
    print("Clearing previous vitals for demo 8270 from Supabase...")
    try:
        supabase.table("vitals").delete().eq("patient_id", "8270").execute()
    except Exception as e:
        print("Warning: Could not clear previous vitals:", e)

    # Insert in batches
    batch_size = 50
    inserted_count = 0
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        try:
            supabase.table("vitals").insert(batch).execute()
            inserted_count += len(batch)
            print(f"Inserted batch {i // batch_size + 1}: {len(batch)} records (Total: {inserted_count})")
        except Exception as e:
            print(f"Failed to insert batch {i // batch_size + 1}: {e}")
            
    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_data()
