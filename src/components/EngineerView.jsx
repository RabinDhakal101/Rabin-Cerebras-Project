import { useMemo, useState } from "react";
import { detectAnomalies } from "../utils/anomalyDetection";
import { formatNumber } from "../utils/metrics";
import VerdictBadge from "./VerdictBadge";

export default function EngineerView({ groups }) {
  const [selectedKey, setSelectedKey] = useState(groups[0]?.key || "");

  const selectedGroup = useMemo(() => {
    return groups.find((group) => group.key === selectedKey) || groups[0];
  }, [groups, selectedKey]);

  if (!groups.length || !selectedGroup) return null;

  const warnings = detectAnomalies(selectedGroup);
  const columns = selectedGroup.metrics?.columns || {};

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Engineer diagnostics view</h2>
          <p>
            Inspect a sweep in more detail, check detected columns, and review
            anomalies before sharing results externally.
          </p>
        </div>

        <select
          className="select-input"
          value={selectedGroup.key}
          onChange={(event) => setSelectedKey(event.target.value)}
        >
          {groups.map((group) => (
            <option key={group.key} value={group.key}>
              {group.model} · {group.profile}
            </option>
          ))}
        </select>
      </div>

      <div className="engineer-grid">
        <div className="diagnostic-card">
          <h3>Selected sweep</h3>
          <p>
            <strong>{selectedGroup.model}</strong> · {selectedGroup.profile}
          </p>
          <p>Rows parsed: {selectedGroup.metrics?.rowCount ?? 0}</p>
          <VerdictBadge verdict={selectedGroup.verdict} />
        </div>

        <div className="diagnostic-card">
          <h3>Detected metric columns</h3>
          <ul className="column-list">
            <li>Throughput: {columns.throughputCol || "Not detected"}</li>
            <li>Generation speed: {columns.outputTokSecCol || "Not detected"}</li>
            <li>TTFT: {columns.ttftCol || "Not detected"}</li>
            <li>Latency: {columns.latencyCol || "Not detected"}</li>
            <li>Context: {columns.contextCol || "Not detected"}</li>
          </ul>
        </div>
      </div>

      <div className="engineer-metrics">
        <div>
          <span>Min throughput</span>
          <strong>{formatNumber(selectedGroup.metrics?.minThroughput)}</strong>
        </div>
        <div>
          <span>Max throughput</span>
          <strong>{formatNumber(selectedGroup.metrics?.maxThroughput)}</strong>
        </div>
        <div>
          <span>Min latency</span>
          <strong>{formatNumber(selectedGroup.metrics?.minLatency)}</strong>
        </div>
        <div>
          <span>Max latency</span>
          <strong>{formatNumber(selectedGroup.metrics?.maxLatency)}</strong>
        </div>
      </div>

      <div className="anomaly-box">
        <h3>Anomaly checks</h3>
        {warnings.map((warning, index) => (
          <p key={index} className={`warning-line ${warning.severity}`}>
            {warning.message}
          </p>
        ))}
      </div>
    </section>
  );
}