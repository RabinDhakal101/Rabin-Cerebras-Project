export default function VerdictBadge({ verdict }) {
  const severity = verdict?.severity || "neutral";
  const status = verdict?.status || "Unknown";

  return <span className={`badge ${severity}`}>{status}</span>;
}