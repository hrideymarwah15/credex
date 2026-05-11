import type { UseCase } from "./types";

type TeamBucket = "1-5" | "6-20" | "21-100" | "100+";

interface BenchmarkData {
  p25: number;
  p50: number;
  p75: number;
}

const BENCHMARKS: Record<UseCase, Record<TeamBucket, BenchmarkData>> = {
  coding: {
    "1-5":   { p25: 28, p50: 52, p75: 85 },
    "6-20":  { p25: 35, p50: 62, p75: 95 },
    "21-100": { p25: 40, p50: 68, p75: 105 },
    "100+":  { p25: 45, p50: 75, p75: 120 },
  },
  writing: {
    "1-5":   { p25: 15, p50: 30, p75: 55 },
    "6-20":  { p25: 18, p50: 35, p75: 60 },
    "21-100": { p25: 20, p50: 38, p75: 65 },
    "100+":  { p25: 22, p50: 42, p75: 70 },
  },
  data: {
    "1-5":   { p25: 20, p50: 40, p75: 70 },
    "6-20":  { p25: 25, p50: 48, p75: 80 },
    "21-100": { p25: 30, p50: 55, p75: 90 },
    "100+":  { p25: 35, p50: 60, p75: 100 },
  },
  research: {
    "1-5":   { p25: 12, p50: 25, p75: 45 },
    "6-20":  { p25: 15, p50: 30, p75: 50 },
    "21-100": { p25: 18, p50: 35, p75: 58 },
    "100+":  { p25: 20, p50: 38, p75: 62 },
  },
  mixed: {
    "1-5":   { p25: 22, p50: 42, p75: 72 },
    "6-20":  { p25: 28, p50: 50, p75: 82 },
    "21-100": { p25: 32, p50: 55, p75: 88 },
    "100+":  { p25: 38, p50: 62, p75: 98 },
  },
};

function getBucket(teamSize: number): TeamBucket {
  if (teamSize <= 5) return "1-5";
  if (teamSize <= 20) return "6-20";
  if (teamSize <= 100) return "21-100";
  return "100+";
}

export interface BenchmarkResult {
  perSeatSpend: number;
  cohortP25: number;
  cohortP50: number;
  cohortP75: number;
  percentile: number;
  rating: "below" | "average" | "above";
  bucket: TeamBucket;
}

export function getBenchmark(
  useCase: UseCase,
  teamSize: number,
  perSeatSpend: number,
): BenchmarkResult {
  const bucket = getBucket(teamSize);
  const data = BENCHMARKS[useCase][bucket];

  let percentile: number;
  if (perSeatSpend <= data.p25) {
    percentile = Math.round((perSeatSpend / data.p25) * 25);
  } else if (perSeatSpend <= data.p50) {
    percentile = 25 + Math.round(((perSeatSpend - data.p25) / (data.p50 - data.p25)) * 25);
  } else if (perSeatSpend <= data.p75) {
    percentile = 50 + Math.round(((perSeatSpend - data.p50) / (data.p75 - data.p50)) * 25);
  } else {
    percentile = Math.min(99, 75 + Math.round(((perSeatSpend - data.p75) / data.p75) * 25));
  }

  let rating: "below" | "average" | "above";
  if (perSeatSpend <= data.p25) rating = "below";
  else if (perSeatSpend <= data.p75) rating = "average";
  else rating = "above";

  return {
    perSeatSpend,
    cohortP25: data.p25,
    cohortP50: data.p50,
    cohortP75: data.p75,
    percentile,
    rating,
    bucket,
  };
}
