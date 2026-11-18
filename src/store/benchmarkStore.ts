import { BenchmarkId, BenchmarkResult, BenchmarkStats, BenchmarkStoreData } from '../types/benchmark';
import { BENCHMARKS_CATALOG, BENCHMARK_MAP } from '../data/benchmarks';
import { calculatePercentile, getCognitiveGrade } from '../utils/statistics';

const STORAGE_KEY = 'etablissements_benchmark_records_v1';

function createInitialStore(): BenchmarkStoreData {
  const store: Partial<BenchmarkStoreData> = {};
  for (const b of BENCHMARKS_CATALOG) {
    store[b.id] = {
      bestScore: null,
      latestScore: null,
      trialsCount: 0,
      history: []
    };
  }
  return store as BenchmarkStoreData;
}

export function loadStore(): BenchmarkStoreData {
  if (typeof window === 'undefined') return createInitialStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialStore();
    const parsed = JSON.parse(raw);
    const initial = createInitialStore();
    // Merge defensively
    for (const b of BENCHMARKS_CATALOG) {
      if (parsed[b.id]) {
        initial[b.id] = {
          bestScore: parsed[b.id].bestScore ?? null,
          latestScore: parsed[b.id].latestScore ?? null,
          trialsCount: parsed[b.id].trialsCount ?? 0,
          history: Array.isArray(parsed[b.id].history) ? parsed[b.id].history : []
        };
      }
    }
    return initial;
  } catch (err) {
    console.error('Failed to load benchmark store from localStorage', err);
    return createInitialStore();
  }
}

export function saveStore(store: BenchmarkStoreData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to save benchmark store to localStorage', err);
  }
}

export function recordBenchmarkResult(
  store: BenchmarkStoreData,
  benchmarkId: BenchmarkId,
  score: number,
  trials: { trialIndex: number; value: number; valid: boolean }[] = []
): { updatedStore: BenchmarkStoreData; newResult: BenchmarkResult } {
  const meta = BENCHMARK_MAP.get(benchmarkId);
  const percentile = meta
    ? calculatePercentile(score, meta.normativeMedian, meta.normativeStdDev, meta.higherIsBetter)
    : 50;

  const grade = getCognitiveGrade(percentile);

  const newResult: BenchmarkResult = {
    benchmarkId,
    score,
    trials,
    percentile,
    timestamp: Date.now(),
    grade
  };

  const currentStats = store[benchmarkId] || {
    bestScore: null,
    latestScore: null,
    trialsCount: 0,
    history: []
  };

  let newBest = currentStats.bestScore;
  if (newBest === null) {
    newBest = score;
  } else if (meta?.higherIsBetter) {
    newBest = Math.max(newBest, score);
  } else {
    newBest = Math.min(newBest, score);
  }

  const updatedStats: BenchmarkStats = {
    bestScore: newBest,
    latestScore: score,
    trialsCount: currentStats.trialsCount + 1,
    history: [newResult, ...currentStats.history].slice(0, 50) // keep last 50
  };

  const updatedStore: BenchmarkStoreData = {
    ...store,
    [benchmarkId]: updatedStats
  };

  saveStore(updatedStore);
  return { updatedStore, newResult };
}

export function calculateGlobalCognitiveIndex(store: BenchmarkStoreData): {
  averagePercentile: number | null;
  testsCompletedCount: number;
  grade: string;
} {
  const percentiles: number[] = [];

  for (const b of BENCHMARKS_CATALOG) {
    const stats = store[b.id];
    if (stats && stats.bestScore !== null) {
      const p = calculatePercentile(stats.bestScore, b.normativeMedian, b.normativeStdDev, b.higherIsBetter);
      percentiles.push(p);
    }
  }

  if (percentiles.length === 0) {
    return {
      averagePercentile: null,
      testsCompletedCount: 0,
      grade: 'NON ÉVALUÉ'
    };
  }

  const sum = percentiles.reduce((acc, curr) => acc + curr, 0);
  const avg = Math.round((sum / percentiles.length) * 10) / 10;
  const grade = getCognitiveGrade(avg);

  return {
    averagePercentile: avg,
    testsCompletedCount: percentiles.length,
    grade
  };
}

export function clearBenchmarkHistory(store: BenchmarkStoreData, benchmarkId?: BenchmarkId): BenchmarkStoreData {
  if (benchmarkId) {
    const updated = {
      ...store,
      [benchmarkId]: {
        bestScore: null,
        latestScore: null,
        trialsCount: 0,
        history: []
      }
    };
    saveStore(updated);
    return updated;
  } else {
    const initial = createInitialStore();
    saveStore(initial);
    return initial;
  }
}
