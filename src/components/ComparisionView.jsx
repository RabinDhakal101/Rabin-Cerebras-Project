import VerdictBadge from "./VerdictBadge";
import { formatNumber } from "../utils/metric";

export default function ComparisonView({ groups }) {
  if (!groups.length) return null;

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Model comparison view</h2>
          <p>
            Compare all uploaded model/profile sweeps side by side. This is the
            main view when multiple Excel files are uploaded.
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Model</th>
              <th>Profile</th>
              <th>Rows</th>
              <th>Avg throughput</th>
              <th>Avg gen speed</th>
              <th>Avg TTFT</th>
              <th>Avg latency</th>
              <th>Verdict</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {groups.map((group, index) => (
              <tr key={group.key}>
                <td>#{index + 1}</td>
                <td>{group.model}</td>
                <td>{group.profile}</td>
                <td>{group.metrics?.rowCount ?? 0}</td>
                <td>{formatNumber(group.metrics?.avgThroughput)}</td>
                <td>{formatNumber(group.metrics?.avgOutputTokSec)}</td>
                <td>{formatNumber(group.metrics?.avgTTFT)}</td>
                <td>{formatNumber(group.metrics?.avgLatency)}</td>
                <td>
                  <VerdictBadge verdict={group.verdict} />
                </td>
                <td>{group.verdict.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}