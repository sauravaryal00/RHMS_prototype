import os, uuid
from datetime import datetime, timedelta
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.local")
url = os.getenv("VITE_SUPABASE_URL", "https://dbsnwlvfonemjhmajlbi.supabase.co")
key = os.getenv("VITE_SUPABASE_ANON_KEY", "sb_publishable_Qijy32ktt59tgIEzFHv2sA_tZ54kDmX")
supabase = create_client(url, key)

# Try a full insert matching actual server code (no request_id)
import hashlib
token_id = f"tok_{uuid.uuid4()}"
test_data = {
    "token_id": token_id,
    "patient_id": "P001",
    "clinician_id": "D001",
    "clinician_role": "Doctor",
    "purpose": "Test",
    "scope": ["Heart Rate", "Blood Pressure", "Oxygen Levels"],
    "issued_at": datetime.now().isoformat(),
    "expires_at": (datetime.now() + timedelta(minutes=60)).isoformat(),
    "revoked": False,
    "signature": hashlib.sha256(token_id.encode()).hexdigest()[:16]
}
try:
    r = supabase.table("consent_tokens").insert(test_data).execute()
    print("✅ Insert SUCCESS:", r.data[0]['token_id'] if r.data else r)
except Exception as e:
    print("❌ Insert Error:", e)
