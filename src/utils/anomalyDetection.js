function isValidNumber(value) {
  return Number.isFinite(value);
}

function buildWarning(message, severity = "warning") {
  return {
    message,
    severity,
  };
}

export function detectAnomalies(group) {
  const warnings = [];
  const metrics = group?.metrics;

  if (!metrics) {
    return [
      buildWarning("No metrics were available for this model/profile.", "neutral"),
    ];
  }

  if (metrics.rowCount === 0) {
    warnings.push(buildWarning("This sweep has no parsed rows.", "bad"));
  }

  if (
    isValidNumber(metrics.minThroughput) &&
    isValidNumber(metrics.maxThroughput) &&
    metrics.maxThroughput > metrics.minThroughput * 3
  ) {
    warnings.push(
      buildWarning(
        "Throughput varies by more than 3x across this sweep. This may indicate a config sensitivity or an outlier.",
        "warning"
      )
    );
  }

  if (
    isValidNumber(metrics.minLatency) &&
    isValidNumber(metrics.maxLatency) &&
    metrics.maxLatency > metrics.minLatency * 3
  ) {
    warnings.push(
      buildWarning(
        "Latency varies by more than 3x across this sweep. Review the underlying rows before sharing externally.",
        "warning"
      )
    );
  }

  if (isValidNumber(metrics.avgTTFT) && metrics.avgTTFT > 5) {
    warnings.push(
      buildWarning(
        "Average TTFT is high. Customer-facing chat or interactive workloads may feel slow.",
        "bad"
      )
    );
  }

  if (isValidNumber(metrics.avgLatency) && metrics.avgLatency > 20) {
    warnings.push(
      buildWarning(
        "Average end-to-end latency is high. This may be a poor fit for latency-sensitive workloads.",
        "bad"
      )
    );
  }

  if (
    metrics.columns &&
    !metrics.columns.throughputCol &&
    !metrics.columns.outputTokSecCol
  ) {
    warnings.push(
      buildWarning(
        "No throughput or generation-speed column was detected. The customer verdict may be incomplete.",
        "warning"
      )
    );
  }

  if (warnings.length === 0) {
    warnings.push(
      buildWarning("No obvious anomalies were detected in this sweep.", "good")
    );
  }

  return warnings;
}