import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadStore,
  recordBenchmarkResult,
  calculateGlobalCognitiveIndex,
  clearBenchmarkHistory
} from '../benchmarkStore';

describe('Benchmark Store & Aggregate Index', () => {
  beforeEach(() => {
    // Clear localStorage mockup
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('initializes store with all 8 benchmarks unrecorded', () => {
    const store = loadStore();
    expect(store['visual-reaction'].bestScore).toBeNull();
    expect(store['visual-reaction'].history).toHaveLength(0);

    const index = calculateGlobalCognitiveIndex(store);
    expect(index.testsCompletedCount).toBe(0);
    expect(index.averagePercentile).toBeNull();
  });

  it('records visual reaction result where lower score is better', () => {
    let store = loadStore();

    // First trial: 248ms (exact population median)
    const step1 = recordBenchmarkResult(store, 'visual-reaction', 248);
    store = step1.updatedStore;
    expect(store['visual-reaction'].bestScore).toBe(248);
    expect(store['visual-reaction'].latestScore).toBe(248);
    expect(step1.newResult.percentile).toBe(50);

    // Second trial: 215ms (faster, should become new best)
    const step2 = recordBenchmarkResult(store, 'visual-reaction', 215);
    store = step2.updatedStore;
    expect(store['visual-reaction'].bestScore).toBe(215);

    // Third trial: 280ms (slower, best should stay 215)
    const step3 = recordBenchmarkResult(store, 'visual-reaction', 280);
    store = step3.updatedStore;
    expect(store['visual-reaction'].bestScore).toBe(215);
    expect(store['visual-reaction'].latestScore).toBe(280);
    expect(store['visual-reaction'].trialsCount).toBe(3);
  });

  it('records memory result where higher score is better', () => {
    let store = loadStore();

    // Sequence memory: 8 levels
    const step1 = recordBenchmarkResult(store, 'sequence-memory', 8);
    store = step1.updatedStore;
    expect(store['sequence-memory'].bestScore).toBe(8);

    // Score 12 levels (better, should update)
    const step2 = recordBenchmarkResult(store, 'sequence-memory', 12);
    store = step2.updatedStore;
    expect(store['sequence-memory'].bestScore).toBe(12);

    // Score 6 levels (lower, best stays 12)
    const step3 = recordBenchmarkResult(store, 'sequence-memory', 6);
    store = step3.updatedStore;
    expect(store['sequence-memory'].bestScore).toBe(12);
  });

  it('computes global cognitive index accurately', () => {
    let store = loadStore();

    // 250ms reaction time is 50th percentile
    store = recordBenchmarkResult(store, 'visual-reaction', 248).updatedStore;
    // 8 levels sequence memory is ~50th percentile
    store = recordBenchmarkResult(store, 'sequence-memory', 8).updatedStore;

    const index = calculateGlobalCognitiveIndex(store);
    expect(index.testsCompletedCount).toBe(2);
    expect(index.averagePercentile).toBeCloseTo(50, 0);
  });

  it('resets history cleanly', () => {
    let store = loadStore();
    store = recordBenchmarkResult(store, 'visual-reaction', 200).updatedStore;
    expect(store['visual-reaction'].bestScore).toBe(200);

    const cleared = clearBenchmarkHistory(store, 'visual-reaction');
    expect(cleared['visual-reaction'].bestScore).toBeNull();
    expect(cleared['visual-reaction'].history).toHaveLength(0);
  });
});
