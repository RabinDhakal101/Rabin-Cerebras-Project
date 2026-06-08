function normalizeKey(key) {
  return String(key || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findColumn(row, candidates) {
  if (!row) return null;

  const keys = Object.keys(row);

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeKey(candidate);

    const match = keys.find((key) =>
      normalizeKey(key).includes(normalizedCandidate)
    );

    if (match) return match;
  }

  return null;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
}

function average(values) {
  const nums = values.filter((value) => Number.isFinite(value));

  if (!nums.length) return null;

  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function max(values) {
  const nums = values.filter((value) => Number.isFinite(value));

  if (!nums.length) return null;

  return Math.max(...nums);
}

function min(values) {
  const nums = values.filter((value) => Number.isFinite(value));

  if (!nums.length) return null;

  return Math.min(...nums);
}

export function detectMetricColumns(rows) {
  const sample = rows.find((row) => row && Object.keys(row).length > 0);

  if (!sample) {
    return {
      throughputCol: null,
      outputTokSecCol: null,
      ttftCol: null,
      latencyCol: null,
      contextCol: null,
      inputTokensCol: null,
      outputTokensCol: null,
      costCol: null,
    };
  }

  return {
    throughputCol: findColumn(sample, [
      "throughput",
      "total throughput",
      "tok/s",
      "tokens/sec",
      "tokens per second",
      "tokens_per_second",
    ]),

    outputTokSecCol: findColumn(sample, [
      "generation speed",
      "gen speed",
      "output tok/s",
      "output tokens/sec",
      "decode throughput",
      "decode tok/s",
    ]),

    ttftCol: findColumn(sample, [
      "ttft",
      "time to first token",
      "first token latency",
    ]),

    latencyCol: findColumn(sample, [
      "latency",
      "total latency",
      "e2e latency",
      "end to end latency",
    ]),

    contextCol: findColumn(sample, [
      "context",
      "context length",
      "sequence length",
      "seq len",
    ]),

    inputTokensCol: findColumn(sample, [
      "input tokens",
      "prompt tokens",
      "input length",
      "prompt length",
    ]),

    outputTokensCol: findColumn(sample, [
      "output tokens",
      "completion tokens",
      "generation tokens",
      "output length",
    ]),

    costCol: findColumn(sample, [
      "cost",
      "price",
      "dollars",
      "usd",
    ]),
  };
}

export function summarizeRows(rows) {
  if (!rows || rows.length === 0) {
    return null;
  }

  const columns = detectMetricColumns(rows);

  const valuesFor = (column) => {
    if (!column) return [];
    return rows.map((row) => toNumber(row[column])).filter((value) => value !== null);
  };

  const throughputValues = valuesFor(columns.throughputCol);
  const outputTokSecValues = valuesFor(columns.outputTokSecCol);
  const ttftValues = valuesFor(columns.ttftCol);
  const latencyValues = valuesFor(columns.latencyCol);
  const contextValues = valuesFor(columns.contextCol);
  const inputTokenValues = valuesFor(columns.inputTokensCol);
  const outputTokenValues = valuesFor(columns.outputTokensCol);
  const costValues = valuesFor(columns.costCol);

  return {
    rowCount: rows.length,

    avgThroughput: average(throughputValues),
    maxThroughput: max(throughputValues),
    minThroughput: min(throughputValues),

    avgOutputTokSec: average(outputTokSecValues),
    maxOutputTokSec: max(outputTokSecValues),

    avgTTFT: average(ttftValues),
    maxTTFT: max(ttftValues),
    minTTFT: min(ttftValues),

    avgLatency: average(latencyValues),
    maxLatency: max(latencyValues),
    minLatency: min(latencyValues),

    maxContext: max(contextValues),
    avgInputTokens: average(inputTokenValues),
    avgOutputTokens: average(outputTokenValues),

    avgCost: average(costValues),

    columns,
  };
}

export function groupRowsByModelProfile(rows) {
  const groups = new Map();

  rows.forEach((row) => {
    const key = `${row.model || "Unknown Model"}__${row.profile || "Unknown Profile"}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        model: row.model || "Unknown Model",
        profile: row.profile || "Unknown Profile",
        rows: [],
      });
    }

    groups.get(key).rows.push(row);
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    metrics: summarizeRows(group.rows),
  }));
}

export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  });
}