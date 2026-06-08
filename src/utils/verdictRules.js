export const DEFAULT_TARGETS = {
  minThroughput: 500,
  minOutputTokSec: 250,
  maxTTFT: 100,
  maxLatency: 10,
};

function isMissing(value) {
  return value === null || value === undefined || Number.isNaN(value);
}

export function getVerdict(metrics, targets = DEFAULT_TARGETS) {
  if (!metrics) {
    return {
      status: "Unknown",
      severity: "neutral",
      reason: "No usable performance data was found.",
      failedChecks: [],
      passedChecks: [],
    };
  }

  const checks = [];

  if (!isMissing(metrics.avgThroughput)) {
    checks.push({
      name: "Throughput",
      passed: metrics.avgThroughput >= targets.minThroughput,
      actual: metrics.avgThroughput,
      target: targets.minThroughput,
      direction: "min",
    });
  }

  if (!isMissing(metrics.avgOutputTokSec)) {
    checks.push({
      name: "Generation speed",
      passed: metrics.avgOutputTokSec >= targets.minOutputTokSec,
      actual: metrics.avgOutputTokSec,
      target: targets.minOutputTokSec,
      direction: "min",
    });
  }

  if (!isMissing(metrics.avgTTFT)) {
    checks.push({
      name: "TTFT",
      passed: metrics.avgTTFT <= targets.maxTTFT,
      actual: metrics.avgTTFT,
      target: targets.maxTTFT,
      direction: "max",
    });
  }

  if (!isMissing(metrics.avgLatency)) {
    checks.push({
      name: "Latency",
      passed: metrics.avgLatency <= targets.maxLatency,
      actual: metrics.avgLatency,
      target: targets.maxLatency,
      direction: "max",
    });
  }

  if (checks.length === 0) {
    return {
      status: "Unknown",
      severity: "neutral",
      reason:
        "The app could not detect throughput, generation speed, TTFT, or latency columns.",
      failedChecks: [],
      passedChecks: [],
    };
  }

  const failedChecks = checks.filter((check) => !check.passed);
  const passedChecks = checks.filter((check) => check.passed);

  if (failedChecks.length === 0) {
    return {
      status: "Go",
      severity: "good",
      reason: "This sweep meets the selected performance targets.",
      failedChecks,
      passedChecks,
    };
  }

  if (failedChecks.length === 1) {
    return {
      status: "Risky",
      severity: "warning",
      reason: `${failedChecks[0].name} misses the selected target, so this should be reviewed before using it for a customer commitment.`,
      failedChecks,
      passedChecks,
    };
  }

  return {
    status: "No-Go",
    severity: "bad",
    reason:
      "This sweep misses multiple performance targets and is not a good fit for the selected workload.",
    failedChecks,
    passedChecks,
  };
}

export function rankGroups(groups, targets = DEFAULT_TARGETS) {
  return groups
    .map((group) => ({
      ...group,
      verdict: getVerdict(group.metrics, targets),
    }))
    .sort((a, b) => {
      const scoreA = scoreGroup(a);
      const scoreB = scoreGroup(b);
      return scoreB - scoreA;
    });
}

function scoreGroup(group) {
  const metrics = group.metrics;

  if (!metrics) return -Infinity;

  const throughputScore = metrics.avgThroughput ?? 0;
  const outputScore = metrics.avgOutputTokSec ?? 0;
  const ttftPenalty = metrics.avgTTFT ? metrics.avgTTFT * 100 : 0;
  const latencyPenalty = metrics.avgLatency ? metrics.avgLatency * 25 : 0;

  return throughputScore + outputScore - ttftPenalty - latencyPenalty;
}