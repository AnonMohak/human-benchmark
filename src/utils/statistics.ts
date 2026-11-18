// Error function approximation (Abramowitz & Stegun formula 7.1.26, max error < 1.5e-7)
export function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);

  return sign * y;
}

// Standard normal cumulative distribution function
export function normalCdf(z: number): number {
  return 0.5 * (1.0 + erf(z / Math.SQRT2));
}

// Calculate human population percentile (0.1 to 99.9%)
export function calculatePercentile(
  score: number,
  normativeMedian: number,
  normativeStdDev: number,
  higherIsBetter: boolean
): number {
  if (normativeStdDev <= 0) return 50.0;

  const z = higherIsBetter
    ? (score - normativeMedian) / normativeStdDev
    : (normativeMedian - score) / normativeStdDev;

  const rawPercentile = normalCdf(z) * 100;
  const clamped = Math.min(99.9, Math.max(0.1, rawPercentile));
  return Math.round(clamped * 10) / 10;
}

export function getCognitiveGrade(percentile: number): 'EXEMPLARY' | 'SUPERIOR' | 'ABOVE_AVERAGE' | 'MEDIAN' | 'BELOW_MEDIAN' {
  if (percentile >= 95) return 'EXEMPLARY';
  if (percentile >= 80) return 'SUPERIOR';
  if (percentile >= 50) return 'ABOVE_AVERAGE';
  if (percentile >= 30) return 'MEDIAN';
  return 'BELOW_MEDIAN';
}

export function formatGradeLabel(grade: 'EXEMPLARY' | 'SUPERIOR' | 'ABOVE_AVERAGE' | 'MEDIAN' | 'BELOW_MEDIAN'): string {
  switch (grade) {
    case 'EXEMPLARY':
      return 'D’ÉLITE // RANG 1%';
    case 'SUPERIOR':
      return 'SUPÉRIEUR // RANG 10%';
    case 'ABOVE_AVERAGE':
      return 'NOTABLE // SUPÉRIEUR À LA MOYENNE';
    case 'MEDIAN':
      return 'MÉDIAN // STANDARD POPULATION';
    case 'BELOW_MEDIAN':
      return 'EN COURS D’ENTRAÎNEMENT';
  }
}

export interface CurvePoint {
  x: number;
  y: number;
  isUser: boolean;
}

// Generate points for SVG bell curve visualization
export function generateDistributionCurve(
  normativeMedian: number,
  normativeStdDev: number,
  _userScore: number | null,
  steps = 60
): CurvePoint[] {
  const minX = normativeMedian - 3.5 * normativeStdDev;
  const maxX = normativeMedian + 3.5 * normativeStdDev;
  const range = maxX - minX;
  const stepSize = range / (steps - 1);

  const points: CurvePoint[] = [];

  for (let i = 0; i < steps; i++) {
    const x = minX + i * stepSize;
    const z = (x - normativeMedian) / normativeStdDev;
    const y = Math.exp(-0.5 * z * z);
    points.push({
      x: Math.round(x * 10) / 10,
      y,
      isUser: false,
    });
  }

  return points;
}
