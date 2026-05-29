import matplotlib.pyplot as plt
import numpy as np
import re
import os

# Create figures directory
os.makedirs("figures", exist_ok=True)

# Read results
with open("ch5_results.md", "r", encoding="utf-16") as f:
    results_text = f.read()

# Helper to extract a list of latencies from a markdown table block
def extract_column(table_heading, col_index):
    lines = results_text.split(table_heading)[1].split("\n\n")[0].strip().split("\n")
    data = []
    for line in lines:
        if "|" in line and "Run" in line or "Event" in line or "tx/s" in line:
            parts = line.split("|")
            if len(parts) > col_index:
                val = re.sub(r'[^\d.]+', '', parts[col_index])
                if val:
                    data.append(float(val))
    return data

# Extract means
token_mean = float(re.search(r'\*\*Mean Latency:\*\* ([\d.]+) ms', results_text.split("TABLE 5.5")[1]).group(1))
val_mean = float(re.search(r'\*\*Mean Latency:\*\* ([\d.]+) ms', results_text.split("TABLE 5.6")[1]).group(1))

# Extract Data
token_latencies = extract_column("TABLE 5.5", 3)
val_latencies = extract_column("TABLE 5.6", 4)
revoke_latencies = extract_column("TABLE 5.7", 3)

throughput_medians = extract_column("TABLE 5.8", 2)
throughput_rps = [100, 200, 300, 400, 500]


# FIGURE 5.1: Denial Rates
plt.figure(figsize=(10, 4))
scenarios = ['Revoked token', 'Expired token', 'Wrong scope', 'Wrong purpose', 'No consent']
rates = [100, 100, 100, 100, 100]
bars = plt.barh(scenarios, rates, color='green')
plt.axvline(x=100, color='red', linestyle='--', label='100% Target')
plt.xlim(0, 115)
for bar in bars:
    plt.text(bar.get_width() + 2, bar.get_y() + bar.get_height()/2, '✓ 100%', va='center', fontweight='bold')
plt.title('Policy Gateway Denial Rates — 100% Across All Scenarios', pad=15)
plt.xlabel('Denial Rate (%)')
plt.legend(loc='lower right')
plt.tight_layout()
plt.savefig('figures/Figure_5_1_Denial_Rates.png', dpi=300)
plt.close()

# FIGURE 5.5: Token Issue Latency
plt.figure(figsize=(10, 6))
runs = np.arange(1, 11)
plt.bar(runs, token_latencies, color='royalblue', zorder=2)
plt.axhline(y=token_mean, color='red', linestyle='--', label=f'Mean: {token_mean:.2f}ms')
plt.axhline(y=1.5, color='orange', linestyle='-', label='Merlec et al. [53] RAFT tx latency: 1.5ms')
plt.ylim(0, 80)
plt.xticks(runs, [f'Run {i}' for i in runs])
plt.ylabel('Milliseconds (ms)')
plt.title(f'Token Issue Latency — 10 Test Runs (Mean {token_mean:.2f}ms)', pad=15)
plt.legend()
plt.grid(axis='y', linestyle='--', alpha=0.7, zorder=1)
plt.figtext(0.5, 0.01, 'Merlec [53] measures pure blockchain tx; proposed model includes AES-256-GCM + HMAC + audit log', ha='center', fontsize=9, style='italic')
plt.tight_layout(rect=[0, 0.03, 1, 1])
plt.savefig('figures/Figure_5_5_Token_Latency.png', dpi=300)
plt.close()

# FIGURE 5.6: Gateway Validation Latency
plt.figure(figsize=(10, 6))
plt.bar(runs, val_latencies, color='mediumseagreen', zorder=2)
plt.axhline(y=val_mean, color='red', linestyle='--', label=f'Mean: {val_mean:.2f}ms')
plt.axhline(y=1.67, color='purple', linestyle='-', label='López Martínez [56] VC verify: 1.67ms')
plt.ylim(0, 80)
plt.xticks(runs, [f'Run {i}' for i in runs])
plt.ylabel('Milliseconds (ms)')
plt.title(f'Gateway Validation Latency — 10 Test Runs (Mean {val_mean:.2f}ms, 7 Conditions)', pad=15)
plt.legend()
plt.grid(axis='y', linestyle='--', alpha=0.7, zorder=1)
plt.figtext(0.5, 0.01, 'VC verify = 1 cryptographic check; proposed gateway = 7 independent conditions', ha='center', fontsize=9, style='italic')
plt.tight_layout(rect=[0, 0.03, 1, 1])
plt.savefig('figures/Figure_5_6_Validation_Latency.png', dpi=300)
plt.close()

# FIGURE 5.7: Revoke-to-Stop Time
plt.figure(figsize=(10, 6))
plt.plot(runs, revoke_latencies, marker='o', color='crimson', linewidth=2, markersize=8)
plt.axhline(y=300, color='red', linestyle='--', label='Acceptable threshold (300ms)')
p99_val = np.percentile(revoke_latencies, 99)
plt.plot(np.argmax(revoke_latencies)+1, np.max(revoke_latencies), marker='*', color='gold', markersize=15, label='p99 worst case')
plt.ylim(0, 50)
plt.xticks(runs, [f'Event {i}' for i in runs])
plt.ylabel('Milliseconds (ms)')
plt.title('Revoke-to-Stop Time — One-Tap Revocation Response for Elderly Patients', pad=15)
plt.legend(loc='upper left')
plt.grid(True, linestyle='--', alpha=0.5)
plt.figtext(0.5, 0.01, 'No revoke-to-stop time reported in any of [52]-[56] — first RHMS measurement', ha='center', fontsize=9, style='italic')
plt.tight_layout(rect=[0, 0.03, 1, 1])
plt.savefig('figures/Figure_5_7_Revoke_To_Stop.png', dpi=300)
plt.close()

# FIGURE 5.8: Throughput Curve
plt.figure(figsize=(10, 6))
plt.plot(throughput_rps, throughput_medians, marker='s', color='darkorange', linewidth=2, markersize=8)
plt.axvline(x=230, color='gray', linestyle='--', label='Merlec et al. [53] blockchain ceiling: 1,000 tx/s')
plt.xlabel('Request load (Requests Per Second)')
plt.ylabel('Median validation latency (ms)')
plt.title('System Throughput Under Increasing Load (500 RPS, 100% Success Rate)', pad=15)
plt.legend()
plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
plt.savefig('figures/Figure_5_8_Throughput.png', dpi=300)
plt.close()

# FIGURE 5.10: Grouped Comparison Bar Chart
labels = ['Token Latency\n(ms)', 'Gateway Latency\n(ms)', 'Throughput\n(RPS)']
proposed = [token_mean, val_mean, 500]
merlec = [1.5, 1.5, 1000]
lopez = [109.53, 1.67, 0] # 0 = N/R

x = np.arange(len(labels))
width = 0.25

fig, ax = plt.subplots(figsize=(10, 6))
rects1 = ax.bar(x - width, proposed, width, label='Proposed Model', color='royalblue')
rects2 = ax.bar(x, merlec, width, label='Merlec et al. [53]', color='darkorange')
rects3 = ax.bar(x + width, lopez, width, label='López Martínez et al. [56]', color='mediumseagreen')

ax.set_ylabel('Value (ms or RPS)')
ax.set_title('Performance Comparison — Proposed Model vs Literature [53][56]', pad=15)
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.legend()

# Add N/R label for Lopez Throughput
ax.text(2 + width, 5, 'N/R', ha='center', va='bottom', color='black', fontweight='bold')

plt.tight_layout()
plt.savefig('figures/Figure_5_10_Grouped_Comparison.png', dpi=300)
plt.close()

print("Figures generated successfully in 'figures/' directory.")
