import sqlite3
conn = sqlite3.connect('rhms_local_experiment.db')
cursor = conn.cursor()
cursor.execute("SELECT token_id FROM consent_tokens WHERE status='approved' LIMIT 1")
print(cursor.fetchone()[0])
conn.close()
