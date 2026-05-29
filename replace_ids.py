import os

files_to_update = [
    "src/hooks/useConsentTokens.js",
    "src/pages/AdminDashboard.jsx",
    "src/pages/AnomalyDetection.jsx",
    "src/pages/ClinicianDashboard.jsx",
    "src/pages/PatientDashboard.jsx",
    "src/utils/mockData.js",
    "backend/deep_analysis_experiments.py",
    "backend/full_thesis_experiments.py",
    "backend/rhms_local_server.py",
    "backend/seed_kaggle_data.py"
]

for filepath in files_to_update:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Replace frontend patient ID
        content = content.replace("patient-42", "8270")
        
        # Replace backend P001 with 8270
        content = content.replace("P001", "8270")
        # Replace D001 with C-994 (Clinician ID)
        content = content.replace("D001", "C-994")
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        print(f"Updated {filepath}")
    else:
        print(f"Skipped {filepath} (not found)")

print("Replacement complete.")
