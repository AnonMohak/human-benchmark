import React, { useState, useRef } from 'react';
import { BenchmarkMetadata, BenchmarkResult } from '../../types/benchmark';
import { formatGradeLabel } from '../../utils/statistics';
import { playSineTone, playSuccessChime } from '../../utils/audio';
import { RotateCcw, Award, ChevronRight } from 'lucide-react';

interface AimTrainerProps {
  meta: BenchmarkMetadata;
  onRecordResult: (score: number, trials: { trialIndex: number; value: number; valid: boolean }[]) => BenchmarkResult;
  onBack: () => void;
}

const TOTAL_TARGETS = 30;
const TARGET_SIZE = 56; // px diameter

export const AimTrainer: React.FC<AimTrainerProps> = ({ meta, onRecordResult, onBack }) => {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [targetsRemaining, setTargetsRemaining] = useState<number>(TOTAL_TARGETS);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 }); // percentage
  const [latencies, setLatencies] = useState<number[]>([]);
  const [finalResult, setFinalResult] = useState<BenchmarkResult | null>(null);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const targetSpawnTimeRef = useRef<number>(0);

  const spawnNextTarget = () => {
    // Random position within 10% to 90% bounds
    const nextX = 10 + Math.random() * 80;
    const nextY = 15 + Math.random() * 70;
    setTargetPos({ x: nextX, y: nextY });
    targetSpawnTimeRef.current = performance.now();
  };

  const startTest = () => {
    setLatencies([]);
    setTargetsRemaining(TOTAL_TARGETS);
    setFinalResult(null);
    setPhase('playing');
    spawnNextTarget();
    playSineTone(440, 0.08, 0.1);
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phase !== 'playing') return;

    const now = performance.now();
    const latency = Math.round(now - targetSpawnTimeRef.current);
    playSineTone(784, 0.05, 0.15); // G5 acoustic feedback

    const updatedLatencies = [...latencies, latency];
    setLatencies(updatedLatencies);

    const remaining = targetsRemaining - 1;
    setTargetsRemaining(remaining);

    if (remaining <= 0) {
      // Completed all 30 targets
      const sum = updatedLatencies.reduce((a, b) => a + b, 0);
      const averageLatency = Math.round(sum / TOTAL_TARGETS);
      const trials = updatedLatencies.map((val, i) => ({
        trialIndex: i + 1,
        value: val,
        valid: true
      }));

      const res = onRecordResult(averageLatency, trials);
      setFinalResult(res);
      setPhase('completed');
      playSuccessChime();
    } else {
      spawnNextTarget();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header breadcrumb */}
      <div className="flex justify-between items-center pb-4 border-b border-hairline dark:border-hairline-dark mb-6">
        <div className="flex items-center space-x-3 text-xs font-mono text-ink-muted">
          <span>CATALOGUE // {meta.index}</span>
          <span>/</span>
          <span className="text-ink dark:text-canvas font-semibold">{meta.catalogName}</span>
        </div>
        <div className="text-xs font-mono text-ink-muted">
          CIBLES RESTANTES : <span className="font-bold text-ink dark:text-canvas">{targetsRemaining}</span> / {TOTAL_TARGETS}
        </div>
      </div>

      {/* Main Testing Surface */}
      <div
        ref={arenaRef}
        className="w-full h-[520px] bg-canvas-pure dark:bg-darkbg-surface border border-hairline dark:border-hairline-dark relative overflow-hidden select-none flex flex-col justify-center items-center"
      >
        {phase === 'idle' && (
          <div className="text-center max-w-xl space-y-6 p-8">
            <span className="text-[11px] font-mono tracking-widest text-ink-muted uppercase block">
              ÉPREUVE NO. {meta.index} — {meta.domainName}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ink dark:text-canvas">
              {meta.title}
            </h2>
            <p className="text-sm font-sans text-ink-muted dark:text-ink-subtle leading-relaxed">
              {meta.summary} Cliquez sur 30 cibles consécutives aussi vite que possible. Votre durée moyenne d'acquisition de cible sera mesurée en millisecondes.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={startTest}
                className="px-8 py-3 bg-ink text-canvas dark:bg-canvas dark:text-ink font-mono text-xs tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <span>INITIER L’ÉPREUVE</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {phase === 'playing' && (
          <>
            {/* Minimalist reticle watermark */}
            <div className="absolute top-4 left-4 text-[10px] font-mono text-ink-subtle">
              CIBLES: {TOTAL_TARGETS - targetsRemaining + 1} / {TOTAL_TARGETS}
            </div>

            {/* Target Disk */}
            <button
              onClick={handleTargetClick}
              style={{
                left: `${targetPos.x}%`,
                top: `${targetPos.y}%`,
                width: `${TARGET_SIZE}px`,
                height: `${TARGET_SIZE}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute rounded-full border-2 border-ink dark:border-canvas bg-canvas-pure dark:bg-darkbg-surface flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-75 shadow-sm group"
            >
              <div className="w-6 h-6 rounded-full bg-lacquer flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </button>
          </>
        )}

        {phase === 'completed' && finalResult && (
          <div className="text-center max-w-xl space-y-6 py-4 p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas dark:bg-darkbg border border-hairline dark:border-hairline-dark text-[11px] font-mono text-ink-muted">
              <Award className="w-3.5 h-3.5 text-lacquer" />
              <span>TEST TERMINÉ</span>
            </div>

            <div>
              <span className="text-xs font-mono tracking-widest text-ink-muted uppercase block mb-1">
                TEMPS MOYEN PAR CIBLE
              </span>
              <div className="text-6xl sm:text-7xl font-serif font-bold text-ink dark:text-canvas tracking-tight">
                {finalResult.score} <span className="text-2xl font-sans font-light text-ink-muted">ms/cible</span>
              </div>
            </div>

            <div className="p-4 bg-canvas dark:bg-darkbg border border-hairline dark:border-hairline-dark max-w-md mx-auto space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-ink-muted uppercase">RANG PERCENTILE :</span>
                <span className="font-bold text-ink dark:text-canvas">{finalResult.percentile}%</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-ink-muted uppercase">QUALIFICATION :</span>
                <span className="font-semibold text-botanical">{formatGradeLabel(finalResult.grade)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-ink-muted uppercase">MÉDIANE POPULATION :</span>
                <span className="text-ink dark:text-canvas">{meta.normativeMedian} ms</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={startTest}
                className="px-6 py-2.5 border border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas font-mono text-xs tracking-wider uppercase flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RECOMMENCER</span>
              </button>
              <button
                onClick={onBack}
                className="px-6 py-2.5 bg-ink text-canvas dark:bg-canvas dark:text-ink font-mono text-xs tracking-wider uppercase hover:opacity-90"
              >
                RETOUR AU CATALOGUE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions & Psychometrics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans border-t border-hairline dark:border-hairline-dark pt-6">
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-semibold text-ink dark:text-canvas">Protocole d'Évaluation</h4>
          <ol className="list-decimal list-inside space-y-1 text-ink-muted dark:text-ink-subtle leading-relaxed">
            {meta.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ol>
        </div>
        <div className="space-y-3 font-mono text-[11px]">
          <h4 className="font-serif text-sm font-semibold text-ink dark:text-canvas">Loi de Fitts &amp; Balistique Motrice</h4>
          <p className="text-ink-muted dark:text-ink-subtle leading-relaxed">
            La loi de Fitts modélise mathématiquement le temps d'acquisition d'une cible selon son éloignement et sa surface : $T = a + b \log_2(2D/W)$. L'épreuve quantifie l'efficacité des saccades oculaires et des ajustements proprioceptifs de la main.
          </p>
        </div>
      </div>
    </div>
  );
};
