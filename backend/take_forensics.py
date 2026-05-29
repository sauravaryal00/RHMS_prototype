import time, requests, json
from playwright.sync_api import sync_playwright

def take_forensic_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 900})
        
        page = context.new_page()
        page.goto("http://localhost:5173/login")
        page.evaluate("""
            localStorage.setItem('rhms_user', JSON.stringify({id: 'ADMIN', name: 'System Admin', role: 'admin', email: 'admin@rhms.com'}));
            localStorage.setItem('rhms_login_time', Date.now().toString());
        """)
        
        page.goto("http://localhost:5173/anomalies")
        page.wait_for_selector("text=Gateway", timeout=20000)
        time.sleep(1)
        
        # Arm the gateway
        page.locator("text=Gateway").locator("xpath=..").locator("button").click()
        time.sleep(1)
        
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
            time.sleep(15) # Wait for terminal and interception
            
            # Click the intercepted threat block
            page.locator(f"button:has-text('{attack_text}')").first.click()
            time.sleep(1)
            
            # SCROLL TO FORENSIC SECTION
            page.locator("text=Forensic Deep-Analysis").scroll_into_view_if_needed()
            time.sleep(1)
            
            # Take screenshot of the exact forensic container instead of the whole page
            # The container has text "Forensic Deep-Analysis" and is a parent
            page.locator("section:has-text('Forensic Deep-Analysis')").screenshot(path=f"figures/Screenshot_{file_prefix}_Forensic_Detail.png")
            
            page.reload()
            page.wait_for_selector("text=Gateway", timeout=20000)
            page.locator("text=Gateway").locator("xpath=..").locator("button").click()
            time.sleep(1)
            
        browser.close()
        print("Done capturing Forensic Detailed screenshots!")

if __name__ == "__main__":
    take_forensic_screenshots()
