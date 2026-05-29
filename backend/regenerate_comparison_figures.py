"""
Regenerate RHMS comparison figures using the 5 correct papers:
[1] Al Amin et al. 2024  – Ethereum smart contracts (no ms latency given)
[2] Merlec et al. 2021   – Quorum blockchain (consensus only: 0.0015 s = 1.5 ms)
[3] Alhajri et al. 2022  – Permissioned BC (no quantitative performance data)
[4] Lopez Martinez et al. 2025 – SSI/DIDs/VCs: VC verify 1.67ms, DIDComm 5.91ms, DID read 11.52ms, VC create 7.24ms, total session ~131ms
[5] Jesus & Pandit 2022  – Consent receipts: under 1 second, ~1KB, no enforcement latency
"""
import json, os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

with open("deep_analysis_results.json") as f:
    D = json.load(f)

os.makedirs("figures", exist_ok=True)

BLUE   = "#2563EB"
GREEN  = "#16A34A"
RED    = "#DC2626"
AMBER  = "#D97706"
PURPLE = "#7C3AED"
TEAL   = "#0D9488"
GREY   = "#6B7280"
DARK   = "#1F2937"
ORANGE = "#EA580C"
PINK   = "#DB2777"

plt.rcParams.update({
    'font.family':      'DejaVu Sans',
    'axes.titlesize':   12,
    'axes.labelsize':   11,
    'xtick.labelsize':  10,
    'ytick.labelsize':  10,
    'axes.spines.top':  False,
    'axes.spines.right':False,
    'figure.dpi':       150,
    'savefig.bbox':     'tight',
    'savefig.dpi':      200,
})

runs = list(range(1, 21))
avg   = D["token_avg"]
avg_v = D["validation_avg"]
avg_r = D["rejection_avg"]
tl    = D["token_latency_20"]
vl    = D["validation_latency_20"]
rl    = D["rejection_latency_20"]

# ─── NOTE ON PAPER DATA ───────────────────────────────────────────────────────
# Lopez Martinez [4]: total per-access overhead = DID read (11.52) + DIDComm (5.91) + VC verify (1.67) = 19.10 ms
#                     plus VC creation per session = 7.24 ms
#                     connection setup = 113.82 ms (one-time per session)
# Merlec [2]:         consensus ONLY latency = 1.5 ms — NOT end-to-end. Not comparable as-is.
# Al Amin [1]:        gas-cost model only; no wall-clock ms reported.
# Alhajri [3]:        formal verification only; no performance numbers.
# Jesus & Pandit [5]: receipt generation < 1000 ms; not an access enforcement latency.

LM_VC_VERIFY   = 1.67    # Lopez Martinez VC verification alone
LM_DID_READ    = 11.52   # Lopez Martinez DID document read
LM_DIDCOMM     = 5.91    # Lopez Martinez DIDComm messaging
LM_TOTAL_ACCESS = round(LM_VC_VERIFY + LM_DID_READ + LM_DIDCOMM, 2)  # 19.10 ms per access
LM_VC_CREATE   = 7.24    # VC creation (token issuance equivalent)
LM_SESSION     = 113.82  # connection setup (one-off per session)

MERLEC_CONSENSUS = 1.5   # Merlec RAFT consensus latency (NOT end-to-end)

# ─── FIGURE 4.1  Token Issue Latency — RHMS vs Lopez Martinez VC Create ────────
fig, ax = plt.subplots(figsize=(10, 5))
ax.bar(runs, tl, color=BLUE, alpha=0.85, label=f"RHMS Token Issue (Avg: {avg} ms)")
ax.axhline(avg, color=GREEN, linewidth=1.5, linestyle="-.", label=f"RHMS Avg: {avg} ms")
ax.axhline(LM_VC_CREATE, color=ORANGE, linewidth=2, linestyle="--",
           label=f"López Martínez et al. [4] VC Create: {LM_VC_CREATE} ms")
ax.axhline(LM_SESSION, color=RED, linewidth=2, linestyle=":",
           label=f"López Martínez et al. [4] Session Setup: {LM_SESSION} ms")
ax.set_xlabel("Test Run")
ax.set_ylabel("Latency (ms)")
ax.set_title(
    "Figure 4.1 — RHMS Token Issue Latency (20 Runs)\n"
    "vs López Martínez et al. [4] VC Creation and Session Setup Cost"
)
ax.set_xticks(runs)
ax.legend(loc="upper right", fontsize=9)
ax.annotate(
    f"RHMS Avg: {avg} ms\n(Al Amin [1], Alhajri [3]:\nno ms data reported)",
    xy=(10, avg), xytext=(13, avg + 25),
    fontsize=8.5, color=BLUE,
    arrowprops=dict(arrowstyle="->", color=BLUE, lw=1.2)
)
plt.tight_layout()
plt.savefig("figures/fig_4_1_token_issue_latency.png")
plt.close()
print("[SAVED] fig_4_1_token_issue_latency.png")

# ─── FIGURE 4.2  Gateway Validation Latency — RHMS vs Lopez Martinez per-access ─
fig, ax = plt.subplots(figsize=(10, 5))
ax.bar(runs, vl, color=TEAL, alpha=0.85, label=f"RHMS Gateway Validation (Avg: {avg_v} ms)")
ax.axhline(avg_v, color=GREEN, linewidth=1.5, linestyle="-.", label=f"RHMS Avg: {avg_v} ms")
ax.axhline(LM_TOTAL_ACCESS, color=ORANGE, linewidth=2, linestyle="--",
           label=f"López Martínez et al. [4] per-access overhead: {LM_TOTAL_ACCESS} ms\n(DID read + DIDComm + VC verify)")
ax.axhline(MERLEC_CONSENSUS, color=PURPLE, linewidth=2, linestyle=":",
           label=f"Merlec et al. [2] RAFT consensus only: {MERLEC_CONSENSUS} ms\n(NOT end-to-end)")
ax.set_xlabel("Test Run")
ax.set_ylabel("Latency (ms)")
ax.set_title(
    "Figure 4.2 — RHMS Gateway Validation Latency (20 Runs)\n"
    "vs López Martínez et al. [4] Per-Access Overhead and Merlec et al. [2] Consensus Layer"
)
ax.set_xticks(runs)
ax.legend(loc="upper right", fontsize=8.5)
ax.annotate(
    f"Alhajri [3] and Al Amin [1]:\nno latency data reported",
    xy=(5, avg_v), xytext=(8, 22),
    fontsize=8.5, color=GREY,
    arrowprops=dict(arrowstyle="->", color=GREY, lw=1.0)
)
plt.tight_layout()
plt.savefig("figures/fig_4_2_gateway_validation_latency.png")
plt.close()
print("[SAVED] fig_4_2_gateway_validation_latency.png")

# ─── FIGURE 4.12  Comparative Performance — 5-paper bar chart ─────────────────
# For papers with no data, we show a hatched "Not Reported" bar at 0 height
# but annotate clearly.
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# --- Sub-plot A: Per-access latency comparison ---
ax = axes[0]
systems = [
    "RHMS\n(This Work)",
    "López Martínez\net al. [4]\n(per-access total)",
    "Merlec et al. [2]\n(consensus layer\nonly)",
    "Jesus & Pandit [5]\n(receipt gen\n< 1000 ms)",
]
latencies = [avg_v, LM_TOTAL_ACCESS, MERLEC_CONSENSUS, None]
colors    = [BLUE,  ORANGE,           PURPLE,           GREY]
hatches   = ["",    "",               "//",             "xx"]
notes     = [
    f"{avg_v} ms\n(7 conditions,\nin-process)",
    f"{LM_TOTAL_ACCESS} ms\n(DID+DIDComm+VC\nverify)",
    f"{MERLEC_CONSENSUS} ms\n(consensus only;\nfull access\nnot measured)",
    "Not applicable\n(transparency,\nnot enforcement)",
]

for i, (sys, lat, col, hatch, note) in enumerate(zip(systems, latencies, colors, hatches, notes)):
    val = lat if lat else 0.5
    b = ax.bar(i, val, color=col, alpha=0.8, width=0.6, hatch=hatch)
    ax.text(i, val + 0.3, note, ha='center', fontsize=8, va='bottom')

ax.set_xticks(range(len(systems)))
ax.set_xticklabels(systems, fontsize=9)
ax.set_ylabel("Per-Access Latency (ms)")
ax.set_title("Access Enforcement Latency Comparison\n(Al Amin [1] and Alhajri [3]: no data reported)", fontsize=11)
ax.set_ylim(0, 30)

# Add text note for missing papers
ax.text(2.5, 28, "Al Amin et al. [1]: gas cost model only — no ms data\nAlhajri et al. [3]: formal proof only — no latency measured",
        fontsize=8, color=GREY, ha='center',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#F9FAFB', edgecolor=GREY))

# --- Sub-plot B: Feature availability across papers ---
ax2 = axes[1]
papers   = ["RHMS", "Al Amin\n[1]", "Merlec\n[2]", "Alhajri\n[3]", "L.Martinez\n[4]", "Jesus &\nPandit [5]"]
features = [
    "Data Access Enforcement",
    "Purpose Binding",
    "Field-level Scope",
    "Revocation",
    "Caregiver Escalation",
    "Audit / Evidence Log",
    "Performance Measured",
]
# 1 = Yes (full), 0.5 = Partial, 0 = No
matrix = [
    [1,   0,   0.5, 1,   1,   0  ],   # Data Access Enforcement
    [1,   0.5, 1,   0,   1,   0  ],   # Purpose Binding
    [1,   0,   1,   0,   0.5, 0  ],   # Field-level Scope
    [1,   1,   1,   1,   1,   0  ],   # Revocation
    [1,   0,   0,   0,   0,   0  ],   # Caregiver Escalation
    [1,   1,   1,   0,   0.5, 1  ],   # Audit / Evidence Log
    [1,   0.5, 0.5, 0,   1,   0.5],   # Performance Measured
]

color_map = {0: "#FCA5A5", 0.5: "#FCD34D", 1: "#86EFAC"}
for r, (feat, row) in enumerate(zip(features, matrix)):
    for c, val in enumerate(row):
        face = color_map[val]
        ax2.add_patch(plt.Rectangle([c-0.4, r-0.4], 0.8, 0.8, color=face, lw=0.5, ec='white'))
        lbl = "Yes" if val == 1 else ("Part." if val == 0.5 else "No")
        ax2.text(c, r, lbl, ha='center', va='center', fontsize=8.5, fontweight='bold')

ax2.set_xticks(range(len(papers)))
ax2.set_xticklabels(papers, fontsize=9)
ax2.set_yticks(range(len(features)))
ax2.set_yticklabels(features, fontsize=9)
ax2.set_xlim(-0.5, len(papers)-0.5)
ax2.set_ylim(-0.5, len(features)-0.5)
ax2.set_title("Feature Availability Comparison\n(Green=Yes, Yellow=Partial, Red=No)", fontsize=11)

# Legend patches
patches = [
    mpatches.Patch(color="#86EFAC", label="Yes (full)"),
    mpatches.Patch(color="#FCD34D", label="Partial"),
    mpatches.Patch(color="#FCA5A5", label="No / Not reported"),
]
ax2.legend(handles=patches, loc='lower right', fontsize=8)

plt.suptitle(
    "Figure 4.12 — Comparative Analysis: RHMS vs Five Related Consent Management Systems [1–5]",
    fontsize=13, fontweight='bold', y=1.01
)
plt.tight_layout()
plt.savefig("figures/fig_4_12_comparative_performance.png")
plt.close()
print("[SAVED] fig_4_12_comparative_performance.png")

# ─── FIGURE 4.14  Architecture Comparison — in-process vs SSI/Blockchain ───────
fig, ax = plt.subplots(figsize=(13, 7))
ax.set_xlim(0, 13)
ax.set_ylim(0, 8)
ax.axis('off')
ax.set_title(
    "Figure 4.14 — Architectural Comparison: RHMS In-Process Enforcement\n"
    "vs SSI/Blockchain-Based Approaches [1–4]",
    fontsize=13, fontweight='bold', pad=15
)

# ── Row 1: RHMS ──
ax.text(0.2, 7.0, "RHMS (This Work)", fontsize=10, color=BLUE, fontweight='bold')
ax.annotate("", xy=(12, 6.5), xytext=(0.5, 6.5),
            arrowprops=dict(arrowstyle="->", color=BLUE, lw=2.5))
for x_pos, label, ms, fc, ec in [
    (2.5, "Clinician\nRequest", "",        "#DBEAFE", BLUE),
    (5.5, "Policy Gateway\n7-Condition\nSQL Check\n(~9 ms)", "",  "#DBEAFE", BLUE),
    (8.8, "HMAC\nVerify\nin-process", "",  "#DBEAFE", BLUE),
    (11.5,"Data\nReleased", "",            "#D1FAE5", GREEN),
]:
    ax.text(x_pos, 6.5, label, ha='center', va='center', fontsize=8.5,
            bbox=dict(boxstyle='round,pad=0.35', facecolor=fc, edgecolor=ec, linewidth=1.5))
ax.text(6.0, 7.1, "Single Round-Trip — No External Calls", fontsize=9, ha='center', color=BLUE, fontweight='bold')

# ── Row 2: Lopez Martinez [4] ──
ax.text(0.2, 5.4, "López Martínez et al. [4] (SSI/DID/VC)", fontsize=10, color=ORANGE, fontweight='bold')
ax.annotate("", xy=(12, 4.9), xytext=(0.5, 4.9),
            arrowprops=dict(arrowstyle="->", color=ORANGE, lw=2))
for x_pos, label in [
    (2.3,  "Clinician\nRequest"),
    (4.8,  "DID\nDocument\nRead\n(11.52ms)"),
    (7.0,  "DIDComm\nMessage\n(5.91ms)"),
    (9.2,  "VC\nVerify\n(1.67ms)"),
    (11.5, "Data\nReleased"),
]:
    ax.text(x_pos, 4.9, label, ha='center', va='center', fontsize=8,
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#FFF7ED', edgecolor=ORANGE, linewidth=1.2))
ax.text(6.5, 5.5, "Three Operations Required Per Access (~19.1 ms; session setup 113.82 ms extra)",
        fontsize=8.5, ha='center', color=ORANGE, fontweight='bold')

# ── Row 3: Merlec [2] / Al Amin [1] / Alhajri [3] ──
ax.text(0.2, 3.7, "Blockchain-Based Systems [1,2,3] (Al Amin / Merlec / Alhajri)", fontsize=10, color=RED, fontweight='bold')
ax.annotate("", xy=(7.5, 3.2), xytext=(0.5, 3.2),
            arrowprops=dict(arrowstyle="->", color=RED, lw=2))
ax.annotate("", xy=(7.5, 2.2), xytext=(7.5, 3.2),
            arrowprops=dict(arrowstyle="->", color=RED, lw=2, linestyle='dashed'))
ax.annotate("", xy=(11.5, 2.2), xytext=(7.5, 2.2),
            arrowprops=dict(arrowstyle="->", color=RED, lw=2))
for x_pos, label, fc in [
    (2.5,  "Clinician\nRequest",               "#FEE2E2"),
    (5.5,  "Smart Contract\nInvocation\n(SC1+SC2)", "#FEE2E2"),
    (7.5,  "Blockchain\nConsensus\nNetwork",   "#FCA5A5"),
    (9.5,  "Gas Cost\n+ Block\nConfirm",       "#FCA5A5"),
    (11.5, "Data\nReleased",                   "#FEE2E2"),
]:
    ax.text(x_pos, 2.7, label, ha='center', va='center', fontsize=8,
            bbox=dict(boxstyle='round,pad=0.3', facecolor=fc, edgecolor=RED, linewidth=1.2))
ax.text(6.5, 3.8, "Network + Consensus Required Per Access (seconds on public chains; gas cost per op)",
        fontsize=8.5, ha='center', color=RED, fontweight='bold')

# ── Row 4: Jesus & Pandit [5] ──
ax.text(0.2, 1.5, "Jesus & Pandit [5] (Consent Receipts)", fontsize=10, color=GREY, fontweight='bold')
ax.annotate("", xy=(6.0, 1.0), xytext=(0.5, 1.0),
            arrowprops=dict(arrowstyle="->", color=GREY, lw=2, linestyle='dashed'))
for x_pos, label, fc in [
    (2.5, "Consent\nAgreed",   "#F9FAFB"),
    (4.5, "Receipt\nGenerated\n(< 1 sec)", "#F9FAFB"),
    (6.5, "Stored on\nUser Side", "#F9FAFB"),
]:
    ax.text(x_pos, 1.0, label, ha='center', va='center', fontsize=8,
            bbox=dict(boxstyle='round,pad=0.3', facecolor=fc, edgecolor=GREY, linewidth=1.2))
ax.text(4.0, 0.3, "NOTE: Receipts provide transparency, not runtime enforcement — no gateway enforcement path",
        fontsize=8.5, ha='center', color=GREY, style='italic')

ax.axhline(4.1, color='#E5E7EB', linestyle="--", linewidth=0.8, alpha=0.7)
ax.axhline(1.7, color='#E5E7EB', linestyle="--", linewidth=0.8, alpha=0.7)

plt.tight_layout()
plt.savefig("figures/fig_4_14_architecture_comparison.png")
plt.close()
print("[SAVED] fig_4_14_architecture_comparison.png")

print("\n" + "=" * 60)
print("  4 COMPARISON FIGURES REGENERATED (correct 5 papers)")
print("  fig_4_1, fig_4_2, fig_4_12, fig_4_14")
print("=" * 60)
