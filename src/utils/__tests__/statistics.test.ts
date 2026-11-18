import { describe, it, expect } from 'vitest';
import { calculatePercentile, getCognitiveGrade, normalCdf } from '../statistics';

describe('Cognitive Statistics & Percentiles', () => {
  it('computes normal CDF correctly at z = 0', () => {
    const cdf0 = normalCdf(0);
    expect(cdf0).toBeCloseTo(0.5, 3);
  });

  it('computes normal CDF correctly at z = 1', () => {
    const cdf1 = normalCdf(1);
    expect(cdf1).toBeCloseTo(0.8413, 3);
  });

  it('computes reaction time percentile when lower is better', () => {
    // Median is 250ms, stdDev is 35ms.
    // If user scores 215ms (1 std dev better), percentile should be ~84.1%
    const p = calculatePercentile(215, 250, 35, false);
    expect(p).toBeGreaterThanOrEqual(83);
    expect(p).toBeLessThanOrEqual(85);

    // If user scores 250ms (exactly median), percentile should be 50.0%
    const pMedian = calculatePercentile(250, 250, 35, false);
    expect(pMedian).toBe(50.0);
  });

  it('computes memory percentile when higher is better', () => {
    // Median is 8 levels, stdDev is 2.5 levels.
    // If user scores 13 levels (2 std dev above), percentile should be > 97%
    const pHigh = calculatePercentile(13, 8, 2.5, true);
    expect(pHigh).toBeGreaterThan(97);

    // Grade should be EXEMPLARY
    const grade = getCognitiveGrade(pHigh);
    expect(grade).toBe('EXEMPLARY');
  });
});
