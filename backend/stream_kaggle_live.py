import os
import csv
import time
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

def stream_data_live():
    print(f"Starting LIVE Stream using Kaggle dataset: {CSV_PATH}...")
    if not os.path.exists(CSV_PATH):
        CSV_PATH_ALT = os.path.join("..", CSV_PATH)
        if os.path.exists(CSV_PATH_ALT):
            csv_file_path = CSV_PATH_ALT
        else:
            print(f"ERROR: CSV file not found at {CSV_PATH}")
            return
    else:
        csv_file_path = CSV_PATH

    print("Connecting to Supabase and streaming data live...")
    print("Press Ctrl+C to stop the stream.\n")

    while True: # Loop indefinitely to keep the stream alive
        with open(csv_file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # Parse parameters directly from Kaggle dataset
                    temp_c = float(row.get("Temperature (°C)", 37.0))
                    temp_f = round((temp_c * 9 / 5) + 32, 1)  
                    bp_sys = float(row.get("Systolic_BP (mmHg)", 120))
                    bp_dia = float(row.get("Diastolic_BP (mmHg)", 80))
                    hr = float(row.get("Heart_Rate (bpm)", 72))
                    
                    # For metrics evaluation, you want EXACT values. 
                    # If SpO2, Respiration, Glucose aren't in your CSV, we will use static fallbacks 
                    # so they don't break the dashboard, but you evaluate on HR, BP, Temp.
                    spo2 = float(row.get("SpO2 (%)", 98.0)) if "SpO2 (%)" in row else 98.0
                    resp = float(row.get("Respiratory_Rate (bpm)", 16)) if "Respiratory_Rate (bpm)" in row else 16
                    glucose = float(row.get("Glucose (mg/dL)", 100)) if "Glucose (mg/dL)" in row else 100

                    # Use CURRENT timestamp so it acts like a live real-time stream
                    current_ts = datetime.now().isoformat() + "+00:00"

                    record = {
                        "patient_id": "patient-42", # Stream to our dashboard's target patient
                        "timestamp": current_ts,
                        "hr": hr,
                        "bp_sys": bp_sys,
                        "bp_dia": bp_dia,
                        "spo2": spo2,
                        "temp": temp_f,
                        "resp": resp,
                        "glucose": glucose
                    }

                    # Push the live Kaggle data row to Supabase
                    supabase.table("vitals").insert(record).execute()
                    
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] Pushed Live Kaggle Data -> HR: {hr}, BP: {bp_sys}/{bp_dia}, Temp: {temp_c}°C")
                    
                    # Wait 2 seconds before pushing the next row
                    time.sleep(2.0)
                    
                except Exception as e:
                    print(f"Skipping row due to error: {e}")
                    time.sleep(0.5)

        print("Reached end of dataset. Looping back to the beginning to continue stream...")

if __name__ == "__main__":
    try:
        stream_data_live()
    except KeyboardInterrupt:
        print("\nLive stream stopped.")
