import time, requests, json
from playwright.sync_api import sync_playwright

def take_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        
        # -------------------------------------------------------------
        # 1. SWAGGER API TESTING (5-6 genuine screenshots)
        # -------------------------------------------------------------
        print("Taking Swagger Screenshots...")
        page = context.new_page()
        page.goto("http://127.0.0.1:8001/docs")
        page.wait_for_selector("text=GET/system/policy", timeout=10000)
        
        # 1.1 Valid Token Issue (200 OK)
        page.click("text=POST/consent/issue")
        page.click("text=Try it out")
        payload = {
            "patient_id": "8270",
            "clinician_id": "C-994",
            "purpose": "monitoring",
            "duration_minutes": 60,
            "scope": "heart_rate,blood_pressure,spo2"
        }
        page.fill("textarea", json.dumps(payload, indent=2))
        page.click("button.execute")
        page.wait_for_selector(".response-col_status:has-text('200')", timeout=10000)
        time.sleep(1)
        page.locator(".responses-wrapper").screenshot(path="figures/Screenshot_01_Swagger_Token_Issue_Valid.png")
        
        # Generate token directly to use in next tests
        r = requests.post("http://127.0.0.1:8001/consent/issue", json=payload)
        token_id = r.json()["token_id"]
        
        # 1.2 Valid Data Vitals Access (200 OK)
        page.click("text=GET/data/vitals")
        page.click("text=Try it out")
        page.fill("input[placeholder='patient_id']", "8270")
        page.fill("input[placeholder='clinician_id']", "C-994")
        page.fill("input[placeholder='purpose']", "monitoring")
        page.fill("input[placeholder='token_id']", token_id)
        page.locator("button.execute").nth(1).click()
        time.sleep(1)
        page.locator(".responses-wrapper").nth(1).screenshot(path="figures/Screenshot_02_Swagger_Vitals_Valid.png")
        
        # 1.3 Invalid Token Signature (403)
        page.fill("input[placeholder='token_id']", "invalid_fake_token_123")
        page.locator("button.execute").nth(1).click()
        time.sleep(1)
        page.locator(".responses-wrapper").nth(1).screenshot(path="figures/Screenshot_03_Swagger_Invalid_Token.png")
        
        # 1.4 Expired Token (403)
        # We simulate this by generating a token with 0 duration
        r_exp = requests.post("http://127.0.0.1:8001/consent/issue", json={**payload, "duration_minutes": 0})
        exp_token = r_exp.json()["token_id"]
        time.sleep(1) # wait for expiry
        page.fill("input[placeholder='token_id']", exp_token)
        page.locator("button.execute").nth(1).click()
        time.sleep(1)
        page.locator(".responses-wrapper").nth(1).screenshot(path="figures/Screenshot_04_Swagger_Expired_Token.png")

        # 1.5 Insufficient Scope (403)
        # We generated token with "heart_rate,blood_pressure,spo2". We'll request something not in scope.
        # But our API just returns what is in scope. To show scope creep block, we can show the Anomaly Dashboard later.
        
        page.close()
        
        # -------------------------------------------------------------
        # 2. REACT DASHBOARDS & ANOMALIES
        # -------------------------------------------------------------
        print("Taking React Dashboard Screenshots...")
        page = context.new_page()
        page.goto("http://localhost:5173/login")
        page.evaluate("""
            localStorage.setItem('rhms_user', JSON.stringify({id: 'ADMIN', name: 'System Admin', role: 'admin', email: 'admin@rhms.com'}));
            localStorage.setItem('rhms_login_time', Date.now().toString());
        """)
        
        # 2.1 Anomaly Dashboard (Main)
        page.goto("http://localhost:5173/anomalies")
        page.wait_for_selector("text=Gateway", timeout=20000)
        time.sleep(1)
        page.screenshot(path="figures/Screenshot_05_React_Anomaly_Main.png")
        
        # Arm the gateway
        page.locator("text=Gateway").locator("xpath=..").locator("button").click()
        time.sleep(1)
        
        # Define attacks and their buttons
        attacks = [
            ("Brute Force Login", "06_Anomaly_BruteForce"),
            ("Foreign IP Access", "11_Anomaly_GeoVelocity"),
            ("Expired Token Replay", "07_Anomaly_TokenReplay"),
            ("Scope Creep", "08_Anomaly_ScopeCreep"),
            ("Unregistered Device", "09_Anomaly_DeviceAnomaly"),
            ("Cardiac Arrest Spike", "10_Anomaly_ClinicalSpike")
        ]
        
        for idx, (attack_text, file_prefix) in enumerate(attacks):
            print(f"Simulating attack: {attack_text}")
            page.locator(f"button:has-text('{attack_text}')").click()
            time.sleep(3) # Wait for terminal to start typing red
            page.screenshot(path=f"figures/Screenshot_{file_prefix}_Terminal.png")
            time.sleep(12) # Wait for simulation to finish and intercept
            
            # Click the intercepted threat block (it should be the first one in the top right list)
            page.locator(f"button:has-text('{attack_text}')").first.click()
            time.sleep(1)
            page.screenshot(path=f"figures/Screenshot_{file_prefix}_Forensic.png", full_page=True)
            
            # Clear threats to avoid cluttering the next screenshot
            page.reload()
            page.wait_for_selector("text=Gateway", timeout=20000)
            page.locator("text=Gateway").locator("xpath=..").locator("button").click()
            time.sleep(1)
        
        # 2.2 Deep Analysis / Security Terminal (Layer 7 / AES-256-GCM / Threat Forecast)
        page.goto("http://localhost:5173/terminal")
        time.sleep(3)
        page.screenshot(path="figures/Screenshot_12_Security_Terminal_Live.png", full_page=True)
        # Click on Predictive Risk Analysis tab
        page.locator("button:has-text('RISK_ANALYSIS')").click()
        time.sleep(1)
        page.screenshot(path="figures/Screenshot_13_Security_Terminal_Predictive.png", full_page=True)

        # 2.3 Audit Logs (showing the blocks)
        page.goto("http://localhost:5173/audit")
        time.sleep(2)
        page.screenshot(path="figures/Screenshot_14_React_Audit_Log.png", full_page=True)
        
        # 2.4 Load Test Results
        page.goto("http://localhost:5173/experiments")
        time.sleep(2)
        page.screenshot(path="figures/Screenshot_15_React_LoadTest_Results.png", full_page=True)
        
        # 2.5 Baseline Comparison
        page.goto("http://localhost:5173/baselines")
        time.sleep(2)
        page.screenshot(path="figures/Screenshot_16_React_Baseline_Comparison.png", full_page=True)
        
        # 2.6 Caregiver & Patient flow
        # Re-login as patient
        page.goto("http://localhost:5173/login")
        page.evaluate("""
            localStorage.setItem('rhms_user', JSON.stringify({id: '8270', name: 'John Doe', role: 'patient', email: 'john@example.com'}));
        """)
        page.goto("http://localhost:5173/patient")
        time.sleep(2)
        
        # Trigger a request via backend to show consent card
        requests.post("http://127.0.0.1:8001/request-access", json={
            "patient_id": "8270", "clinician_id": "C-994", "clinician_name": "Dr. Sarah Jenkins",
            "role": "Cardiologist", "purpose": "Routine Check", "scope": "Heart Rate", "duration_minutes": 30
        })
        time.sleep(3)
        page.screenshot(path="figures/Screenshot_17_Patient_Consent_Card.png", full_page=True)
        
        browser.close()
        print("Done capturing ALL comprehensive screenshots!")

if __name__ == "__main__":
    take_screenshots()
