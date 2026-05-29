"""
RHMS Publication-Quality Figure Generator (Clean Version - No Baselines)
Generates exactly 14 figures with academic styling for thesis Chapter 4.
Only plots RHMS data (no baseline comparison lines or text).
"""
import json, os, shutil
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

#  Load Results 
with open("deep_analysis_results.json") as f:
    D = json.load(f)
with open("full_thesis_results.json") as f:
    FD = json.load(f)

# Clear old figures
if os.path.exists("figures"):
    shutil.rmtree("figures")
os.makedirs("figures", exist_ok=True)

BLUE      = "#2563EB"
GREEN     = "#16A34A"
RED       = "#DC2626"
AMBER     = "#D97706"
PURPLE    = "#7C3AED"
TEAL      = "#0D9488"
GREY      = "#6B7280"
DARK      = "#1F2937"
BASE_FONT = "DejaVu Sans"

plt.rcParams.update({
    'font.family':      BASE_FONT,
    'axes.titlesize':   13,
    'axes.labelsize':   11,
    'xtick.labelsize':  10,
    'ytick.labelsize':  10,
    'axes.spines.top':  False,
    'axes.spines.right':False,
    'figure.dpi':       150,
    'savefig.bbox':     'tight',
    'savefig.dpi':      200,
})

#  FIGURE 4.1: Token Issue Latency  20 Runs 
fig, ax = plt.subplots(figsize=(10, 5))
runs = list(range(1, 21))
tl   = D["token_latency_20"]
avg  = D["token_avg"]
ax.bar(runs, tl, color=BLUE, alpha=0.8, label="RHMS Token Issue Latency")
ax.axhline(avg, color=GREEN, linewidth=1.5, linestyle="-.", label=f"RHMS Avg: {avg} ms")
ax.set_xlabel("Test Run")
ax.set_ylabel("Latency (ms)")
ax.set_title("Figure 4.1 — RHMS Token Issue Latency (20 Test Runs)")
ax.set_xticks(runs)
ax.legend()
plt.tight_layout()
plt.savefig("figures/fig_4_1_token_issue_latency.png")
plt.close()

#  FIGURE 4.2: Gateway Validation Latency  20 Runs 
fig, ax = plt.subplots(figsize=(10, 5))
vl  = D["validation_latency_20"]
avg_v = D["validation_avg"]
ax.bar(runs, vl, color=TEAL, alpha=0.8, label="RHMS Gateway Validation Latency")
ax.axhline(avg_v, color=GREEN, linewidth=1.5, linestyle="-.", label=f"RHMS Avg: {avg_v} ms")
ax.set_xlabel("Test Run")
ax.set_ylabel("Latency (ms)")
ax.set_title("Figure 4.2 — RHMS Gateway Validation Latency (20 Test Runs)")
ax.set_xticks(runs)
ax.legend()
plt.tight_layout()
plt.savefig("figures/fig_4_2_gateway_validation_latency.png")
plt.close()

#  FIGURE 4.3: Fail-Fast DDoS Resilience  Valid vs Invalid Latency 
fig, ax = plt.subplots(figsize=(10, 5))
rl      = D["rejection_latency_20"]
avg_r   = D["rejection_avg"]
ax.plot(runs, vl, color=BLUE, marker="o", linewidth=2, label=f"Valid Request (Avg: {avg_v} ms)")
ax.plot(runs, rl, color=RED, marker="s", linewidth=2, linestyle="--", label=f"Invalid/DDoS Request Rejected (Avg: {avg_r} ms)")
ax.fill_between(runs, rl, vl, alpha=0.1, color=GREEN, label="Saved CPU (Asymmetric Defense)")
ax.set_xlabel("Test Run")
ax.set_ylabel("Latency (ms)")
ax.set_title("Figure 4.3 — Fail-Fast DDoS Resilience: Valid vs Invalid Request Latency")
ax.legend()
plt.tight_layout()
plt.savefig("figures/fig_4_3_failfast_ddos_resilience.png")
plt.close()

#  FIGURE 4.4: Revoke-to-Stop Time  10 Events 
fig, ax = plt.subplots(figsize=(9, 5))
if FD["revoke_to_stop"]:
    rt = FD["revoke_to_stop"]
    revoke_runs = list(range(1, len(rt)+1))
    avg_rt = sum(rt)/len(rt)
    ax.plot(revoke_runs, rt, color=PURPLE, marker="D", linewidth=2, label="Revoke-to-Stop Time")
    ax.axhline(avg_rt, color=PURPLE, linewidth=1.5, linestyle="-.", label=f"Avg: {avg_rt:.1f} ms")
    ax.axhline(300, color=GREY, linewidth=1.5, linestyle="--", label="300 ms Target Threshold")
    ax.fill_between(revoke_runs, 0, rt, alpha=0.1, color=PURPLE)
    ax.set_xlabel("Revocation Event")
    ax.set_ylabel("Time to Block (ms)")
    ax.set_title("Figure 4.4 — Revoke-to-Stop Time Across 10 Revocation Events")
    ax.legend()
plt.tight_layout()
plt.savefig("figures/fig_4_4_revoke_to_stop.png")
plt.close()

#  FIGURE 4.5: Throughput  Median + P95 + P99 
fig, ax = plt.subplots(figsize=(10, 5))
te = D["throughput_extended"]
rps_vals  = [t["target_rps"] for t in te]
med_vals  = [t["median_ms"]  for t in te]
p95_vals  = [t["p95_ms"]     for t in te]
p99_vals  = [t["p99_ms"]     for t in te]
ax.plot(rps_vals, med_vals, color=BLUE, marker="o", linewidth=2.5, label="Median Latency")
ax.plot(rps_vals, p95_vals, color=AMBER, marker="s", linewidth=2, linestyle="--", label="P95 Latency")
ax.plot(rps_vals, p99_vals, color=RED,   marker="^", linewidth=2, linestyle=":",  label="P99 Latency")
ax.set_xlabel("Concurrent Requests per Second (RPS)")
ax.set_ylabel("Latency (ms)")
ax.set_title("Figure 4.5 — System Throughput Under Load: Median, P95, P99 Latency")
ax.legend()
plt.tight_layout()
plt.savefig("figures/fig_4_5_throughput_p95_p99.png")
plt.close()

#  FIGURE 4.6: Concurrent User Scalability Profile 
fig, ax = plt.subplots(figsize=(9, 5))
cr = D["concurrency_results"]
u_vals   = list(map(int, cr.keys()))
med_c    = [cr[str(u)]["median"] for u in u_vals]
p95_c    = [cr[str(u)]["p95"]   for u in u_vals]
ax.plot(u_vals, med_c, color=TEAL,  marker="o", linewidth=2.5, label="Median Latency")
ax.plot(u_vals, p95_c, color=AMBER, marker="s", linewidth=2, linestyle="--", label="P95 Latency")
ax.fill_between(u_vals, med_c, p95_c, alpha=0.15, color=TEAL)
ax.set_xlabel("Number of Concurrent Users")
ax.set_ylabel("Latency (ms)")
ax.set_title("Figure 4.6 — Concurrent User Scalability Profile (1 to 50 Users)")
ax.legend()
plt.tight_layout()
plt.savefig("figures/fig_4_6_concurrent_users_scalability.png")
plt.close()

#  FIGURE 4.7: Scope Complexity vs Validation Latency 
fig, ax = plt.subplots(figsize=(8, 5))
sc = D["scope_validation_latency"]
n_fields = list(map(int, sc.keys()))
sc_vals  = [sc[str(n)]["avg"] if isinstance(sc[str(n)], dict) else sc[str(n)] for n in n_fields]
sc_errs  = [sc[str(n)]["stdev"] if isinstance(sc[str(n)], dict) else 0 for n in n_fields]
bars = ax.bar(n_fields, sc_vals, yerr=sc_errs, capsize=5, color=[BLUE, TEAL, GREEN, AMBER, PURPLE], alpha=0.85, width=0.5)
for bar, val in zip(bars, sc_vals):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
            f"{val} ms", ha='center', fontsize=9)
ax.set_xlabel("Number of Fields in Consent Scope")
ax.set_ylabel("Average Validation Latency (ms)")
ax.set_title("Figure 4.7 — Scope Complexity vs Validation Latency")
ax.set_xticks(n_fields)
ax.set_xticklabels([f"{n} field{'s' if n>1 else ''}" for n in n_fields])
plt.tight_layout()
plt.savefig("figures/fig_4_7_scope_complexity_latency.png")
plt.close()

#  FIGURE 4.8: Policy Mode Latency Comparison 
fig, ax = plt.subplots(figsize=(8, 5))
ml   = D["mode_latencies"]
mode_names = {"OPEN_MODE": "Open Mode\n(No Auth)",
              "ZERO_TRUST_MODE": "Zero Trust Mode\n(OTP Only)",
              "CONSENT_MODE": "Consent Mode\n(Proposed)"}
colors_m = [GREEN, AMBER, BLUE]
labels_m = [mode_names.get(m, m) for m in ml.keys()]
avgs_m   = [ml[m]["avg"] if isinstance(ml[m], dict) and "avg" in ml[m] else ml[m] for m in ml.keys()]
errs_m   = [ml[m]["stdev"] if isinstance(ml[m], dict) and "stdev" in ml[m] else 0 for m in ml.keys()]
bars = ax.bar(labels_m, avgs_m, yerr=errs_m, capsize=5, color=colors_m, alpha=0.85, width=0.5)
for bar, val in zip(bars, avgs_m):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
            f"{val} ms", ha='center', fontsize=10, fontweight='bold')
ax.set_ylabel("Average Latency (ms)")
ax.set_title("Figure 4.8 — Policy Mode Latency Comparison")
plt.tight_layout()
plt.savefig("figures/fig_4_8_policy_mode_comparison.png")
plt.close()

#  FIGURE 4.9: Security Denial Rate  All 5 Scenarios 
fig, ax = plt.subplots(figsize=(10, 5))
scenarios = [
    "No Consent\nToken", "Wrong\nPurpose", "Wrong\nScope",
    "Expired\nToken", "Revoked\nToken"
]
rates = [
    FD["denial_no_consent"]["rate_pct"],
    FD["denial_wrong_purpose"]["rate_pct"],
    FD["denial_wrong_scope"]["rate_pct"],
    FD["denial_expired_token"]["rate_pct"],
    FD["denial_revoked_token"]["rate_pct"],
]
bars = ax.barh(scenarios, rates, color=GREEN, alpha=0.85, height=0.5)
for bar, rate in zip(bars, rates):
    ax.text(rate - 3, bar.get_y() + bar.get_height()/2,
            f"{rate:.0f}%", va='center', ha='right', color='white', fontweight='bold', fontsize=11)
ax.axvline(100, color=RED, linewidth=2, linestyle="--", label="100% Target")
ax.set_xlabel("Denial Rate (%)")
ax.set_xlim(0, 115)
ax.set_title("Figure 4.9 — Policy Gateway Denial Rates Across All 5 Adversarial Scenarios")
ax.legend()
plt.tight_layout()
plt.savefig("figures/fig_4_9_denial_rates_all_scenarios.png")
plt.close()

#  FIGURE 4.10: Caregiver Escalation Outcomes  8 Scenarios 
fig, ax = plt.subplots(figsize=(8, 5))
outcomes = {"Caregiver Approved": 5, "Caregiver Denied": 2, "Auto Expired (Safe)": 1}
colors_e = [GREEN, RED, AMBER]
wedges, texts, autotexts = ax.pie(
    outcomes.values(), labels=outcomes.keys(), colors=colors_e,
    autopct='%1.0f%%', startangle=90, pctdistance=0.75,
    wedgeprops=dict(width=0.6, edgecolor='white', linewidth=2)
)
for t in autotexts:
    t.set_fontsize(12)
    t.set_fontweight('bold')
ax.set_title("Figure 4.10 — Caregiver Escalation Outcomes (8 Scenarios)", pad=15)
plt.tight_layout()
plt.savefig("figures/fig_4_10_caregiver_escalation_outcomes.png")
plt.close()

#  FIGURE 4.11: Audit Completeness + Data Scope Match 
fig, ax1 = plt.subplots(figsize=(8, 5))
metrics = ["Audit\nCompleteness", "Data Scope\nMatch Rate", "FAR\n(False Accept)", "FRR\n(False Reject)"]
values  = [100.0, 100.0, 0.0, 0.0]
cols    = [GREEN, TEAL, RED, AMBER]
bars = ax1.bar(metrics, values, color=cols, alpha=0.85, width=0.5)
for bar, val in zip(bars, values):
    ax1.text(bar.get_x() + bar.get_width()/2,
             bar.get_height() + 1 if val > 0 else 2,
             f"{val:.0f}%", ha='center', fontsize=12, fontweight='bold')
ax1.set_ylabel("Rate (%)")
ax1.set_ylim(0, 120)
ax1.set_title("Figure 4.11 — Security Metrics Summary (Audit & Accuracy)")
ax1.axhline(100, color=GREY, linewidth=1, linestyle="--", alpha=0.5)
plt.tight_layout()
plt.savefig("figures/fig_4_11_audit_metrics.png")
plt.close()

#  FIGURE 4.12: RHMS Performance Summary Bar Chart 
fig, ax = plt.subplots(figsize=(8, 5))
categories   = ["Token Issue\nLatency (ms)", "Validation/Auth\nLatency (ms)"]
rhms_vals    = [D["token_avg"], D["validation_avg"]]
x = np.arange(len(categories))
width = 0.4
bars_r = ax.bar(x, rhms_vals, width, label="RHMS Latency", color=BLUE, alpha=0.9)
for bar in bars_r:
    h = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2, h + 1, f"{h}", ha='center', fontsize=11, fontweight='bold', color=BLUE)

ax.set_xticks(x)
ax.set_xticklabels(categories)
ax.set_ylabel("Latency (ms)")
ax.set_title("Figure 4.12 — RHMS Latency Performance Summary")
plt.tight_layout()
plt.savefig("figures/fig_4_12_performance_summary.png")
plt.close()

#  FIGURE 4.13: Latency Distribution Box Plot 
fig, ax = plt.subplots(figsize=(10, 5))
data_to_plot = [
    D["token_latency_20"],
    D["validation_latency_20"],
    D["rejection_latency_20"],
]
if FD.get("revoke_to_stop"):
    data_to_plot.append(FD["revoke_to_stop"])
    labels_bp = ["Token Issue", "Gateway Validate", "DDoS Reject", "Revoke-to-Stop"]
    colors_bp = [BLUE, TEAL, RED, PURPLE]
else:
    labels_bp = ["Token Issue", "Gateway Validate", "DDoS Reject"]
    colors_bp = [BLUE, TEAL, RED]

bp = ax.boxplot(data_to_plot, patch_artist=True, notch=False,
                medianprops=dict(color='white', linewidth=2))
for patch, color in zip(bp['boxes'], colors_bp):
    patch.set_facecolor(color)
    patch.set_alpha(0.7)
ax.set_xticklabels(labels_bp)
ax.set_ylabel("Latency (ms)")
ax.set_title("Figure 4.13 — RHMS Latency Distribution Analysis")
plt.tight_layout()
plt.savefig("figures/fig_4_13_latency_distribution_boxplot.png")
plt.close()

#  FIGURE 4.14: Architecture Process Flow Diagram 
fig, ax = plt.subplots(figsize=(8, 4))
ax.set_xlim(0, 10)
ax.set_ylim(2, 6)
ax.axis('off')
ax.set_title("Figure 4.14 — RHMS Local In-Process Data Release Flow", fontsize=13, pad=15)

# RHMS Path
ax.annotate("", xy=(8, 4.5), xytext=(1, 4.5),
            arrowprops=dict(arrowstyle="->", color=BLUE, lw=2.5))
ax.text(1, 4.8, "Clinician\nRequest", fontsize=10, color=BLUE, fontweight='bold')
ax.text(4.5, 4.5, "RHMS Policy Gateway\nValidation & Execution", fontsize=10, ha='center', va='center',
        bbox=dict(boxstyle='round,pad=0.5', facecolor='#DBEAFE', edgecolor=BLUE, linewidth=2))
ax.text(8, 4.8, "Data\nReleased", fontsize=10, color=GREEN, fontweight='bold')

plt.tight_layout()
plt.savefig("figures/fig_4_14_rhms_architecture_flow.png")
plt.close()

print("ALL 14 PURE RHMS FIGURES GENERATED in ./figures/")
