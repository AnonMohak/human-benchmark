export type BenchmarkId =
  | 'visual-reaction'
  | 'audio-reaction'
  | 'sequence-memory'
  | 'verbal-memory'
  | 'number-memory'
  | 'chimp-test'
  | 'aim-trainer'
  | 'stroop-test';

export type BenchmarkCategory = 'reflex' | 'memory' | 'spatial' | 'executive';

export type ScoreUnit = 'ms' | 'level' | 'words' | 'digits' | 'targets' | 'points';

export interface BenchmarkMetadata {
  id: BenchmarkId;
  index: string; // e.g. "01", "02"
  title: string;
  catalogName: string; // e.g. "RÉFLEXE VISUEL"
  domainName: string; // e.g. "TEMPS DE RÉACTION SENSORIELLE"
  summary: string;
  instructions: string[];
  category: BenchmarkCategory;
  unit: ScoreUnit;
  higherIsBetter: boolean;
  normativeMedian: number;
  normativeStdDev: number;
  badge: string;
}

export interface BenchmarkTrial {
  trialIndex: number;
  value: number;
  valid: boolean;
}

export interface BenchmarkResult {
  benchmarkId: BenchmarkId;
  score: number;
  trials: BenchmarkTrial[];
  percentile: number;
  timestamp: number;
  grade: 'EXEMPLARY' | 'SUPERIOR' | 'ABOVE_AVERAGE' | 'MEDIAN' | 'BELOW_MEDIAN';
}

export interface BenchmarkStats {
  bestScore: number | null;
  latestScore: number | null;
  trialsCount: number;
  history: BenchmarkResult[];
}

export type BenchmarkStoreData = Record<BenchmarkId, BenchmarkStats>;

export type TestPhase =
  | 'idle'
  | 'ready'
  | 'waiting'
  | 'stimulus'
  | 'early'
  | 'interim'
  | 'playing'
  | 'completed';
