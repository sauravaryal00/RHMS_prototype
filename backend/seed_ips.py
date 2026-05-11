import sqlite3
import hashlib

DB_PATH = 'rhms_audit.db'

def add_trusted_ip(ip_address, entity_name):
    hashed_ip = hashlib.sha256(ip_address.encode()).hexdigest()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Ensure table exists
    c.execute('''CREATE TABLE IF NOT EXISTS trusted_contexts
                 (entity_id TEXT PRIMARY KEY,
                  context_type TEXT,
                  context_value TEXT)''')
    c.execute("INSERT OR REPLACE INTO trusted_contexts (entity_id, context_type, context_value) VALUES (?, ?, ?)", 
              (entity_name, 'HASHED_IP', hashed_ip))
    conn.commit()
    conn.close()
    print(f"Added {entity_name} ({ip_address}) as {hashed_ip[:10]}...")

# Add your IPs
add_trusted_ip('127.0.0.1', 'LOCAL_HOST')
add_trusted_ip('192.168.1.4', 'AUSTRALIA_CLIENT')

print("Database updated with Trusted IPs.")
