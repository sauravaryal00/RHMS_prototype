import hashlib
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=".env.local")

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def add_trusted_ip(ip_address, entity_name):
    hashed_ip = hashlib.sha256(ip_address.encode()).hexdigest()
    
    data = {
        "entity_id": entity_name,
        "context_type": "HASHED_IP",
        "context_value": hashed_ip
    }
    
    supabase.table("trusted_contexts").upsert(data).execute()
    print(f"Cloud Seeded: {entity_name} ({ip_address}) -> {hashed_ip[:10]}...")

# Seed the IPs
add_trusted_ip('127.0.0.1', 'LOCAL_HOST')
add_trusted_ip('192.168.1.4', 'AUSTRALIA_CLIENT')

print("Supabase Cloud Database updated with Trusted IPs.")
