import MetricCard from "./MetricCard";
import VerdictBadge from "./VerdictBadge";
import { formatNumber } from "../utils/metrics";

export default function CustomerView({ groups }) {
  if (!groups.length) {
    return null;
  }

  const bestGroup = groups[0];

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Customer decision view</h2>
          <p>
            A customer-facing summary that turns projection rows into a simple
            go/risk/no-go answer.
          </p>
        </div>
      </div>

      <div className="decision-card">
        <div>
          <p className="eyebrow-dark">Recommended sweep</p>
          <h3>
            {bestGroup.model} · {bestGroup.profile}
          </h3>
          <p>{bestGroup.verdict.reason}</p>
        </div>

        <VerdictBadge verdict={bestGroup.verdict} />
      </div>

      <div className="metric-grid">
        <MetricCard
          label="Average throughput"
          value={formatNumber(bestGroup.metrics?.avgThroughput)}
          helper="Higher is better"
        />
        <MetricCard
          label="Average generation speed"
          value={formatNumber(bestGroup.metrics?.avgOutputTokSec)}
          helper="Output tokens per second"
        />
        <MetricCard
          label="Average TTFT"
          value={formatNumber(bestGroup.metrics?.avgTTFT)}
          helper="Lower is better"
        />
        <MetricCard
          label="Average latency"
          value={formatNumber(bestGroup.metrics?.avgLatency)}
          helper="Lower is better"
        />
      </div>

      <div className="customer-notes">
        <h3>How to read this</h3>
        <p>
          Uploading one sweep gives a single decision. Uploading many sweeps lets
          this view choose the strongest model/profile candidate based on the
          available throughput, generation speed, TTFT, and latency metrics.
        </p>
      </div>
    </section>
  );
}