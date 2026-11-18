import React, { useState, useEffect, useRef } from 'react';
import { BenchmarkMetadata, BenchmarkResult } from '../../types/benchmark';
import { formatGradeLabel } from '../../utils/statistics';
import { playTileTone, playFailureDrone, playSineTone } from '../../utils/audio';
import { RotateCcw, Award, ChevronRight } from 'lucide-react';

interface SequenceMemoryProps {
  meta: BenchmarkMetadata;
  onRecordResult: (score: number) => BenchmarkResult;
  onBack: () => void;
}

type Phase = 'idle' | 'showing' | 'player' | 'failed' | 'completed';

export const SequenceMemory: React.FC<SequenceMemoryProps> = ({ meta, onRecordResult, onBack }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [level, setLevel] = useState<number>(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState<number>(0);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [finalResult, setFinalResult] = useState<BenchmarkResult | null>(null);

  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = () => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const playSequence = (seq: number[]) => {
    clearTimeouts();
    setPhase('showing');
    setActiveTile(null);
    setPlayerStep(0);

    const stepDelay = 550; // ms per step
    seq.forEach((tileIdx, i) => {
      const showTimer = setTimeout(() => {
        setActiveTile(tileIdx);
        playTileTone(tileIdx);

        const hideTimer = setTimeout(() => {
          setActiveTile(null);
        }, 340);
        timeoutIdsRef.current.push(hideTimer);
      }, (i + 1) * stepDelay);

      timeoutIdsRef.current.push(showTimer);
    });

    // Switch to player input phase
    const finishTimer = setTimeout(() => {
      setPhase('player');
    }, (seq.length + 1) * stepDelay);
    timeoutIdsRef.current.push(finishTimer);
  };

  const startTest = () => {
    clearTimeouts();
    setLevel(1);
    setFinalResult(null);
    const initialTile = Math.floor(Math.random() * 9);
    const newSeq = [initialTile];
    setSequence(newSeq);
    playSequence(newSeq);
  };

  const handleTileClick = (tileIdx: number) => {
    if (phase !== 'player') return;

    setActiveTile(tileIdx);
    playTileTone(tileIdx);
    setTimeout(() => setActiveTile(null), 180);

    const expectedTile = sequence[playerStep];

    if (tileIdx === expectedTile) {
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);

      if (nextStep === sequence.length) {
        // Level complete!
        playSineTone(659.25, 0.08, 0.1);
        const nextLevel = level + 1;
        setLevel(nextLevel);

        const nextTile = Math.floor(Math.random() * 9);
        const updatedSequence = [...sequence, nextTile];
        setSequence(updatedSequence);

        const nextRoundTimer = setTimeout(() => {
          playSequence(updatedSequence);
        }, 800);
        timeoutIdsRef.current.push(nextRoundTimer);
      }
    } else {
      // Mistake!
      clearTimeouts();
      playFailureDrone();
      const finalScore = level;
      const res = onRecordResult(finalScore);
      setFinalResult(res);
      setPhase('completed');
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
          NIVEAU : <span className="font-bold text-ink dark:text-canvas">{level}</span>
        </div>
      </div>

      {/* Main Testing Surface */}
      <div className="w-full min-h-[480px] bg-canvas-pure dark:bg-darkbg-surface border border-hairline dark:border-hairline-dark p-8 flex flex-col justify-center items-center">
        {phase === 'idle' && (
          <div className="text-center max-w-xl space-y-6">
            <span className="text-[11px] font-mono tracking-widest text-ink-muted uppercase block">
              ÉPREUVE NO. {meta.index} — {meta.domainName}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ink dark:text-canvas">
              {meta.title}
            </h2>
            <p className="text-sm font-sans text-ink-muted dark:text-ink-subtle leading-relaxed">
              {meta.summary} Mémorisez la trajectoire visuelle dans la matrice 3×3 et reproduisez-la fidèlement dans l'ordre chronologique.
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

        {(phase === 'showing' || phase === 'player') && (
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center">
              <span className="text-xs font-mono tracking-widest uppercase text-ink-muted">
                {phase === 'showing' ? 'OBSERVEZ LE MOTIF...' : 'À VOUS DE REPRODUIRE :'}
              </span>
              <div className="text-xl font-serif font-semibold text-ink dark:text-canvas mt-1">
                Niveau {level} ({playerStep} / {sequence.length})
              </div>
            </div>

            {/* 3x3 Architectural Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-canvas dark:bg-darkbg border border-hairline dark:border-hairline-dark">
              {Array.from({ length: 9 }).map((_, idx) => {
                const isLit = activeTile === idx;
                return (
                  <button
                    key={idx}
                    disabled={phase !== 'player'}
                    onClick={() => handleTileClick(idx)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 border transition-all duration-150 flex items-center justify-center font-mono text-xs ${
                      isLit
                        ? 'bg-ink text-canvas dark:bg-canvas dark:text-ink border-ink dark:border-canvas scale-95 shadow-md'
                        : 'bg-canvas-pure dark:bg-darkbg-surface border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas text-ink-subtle'
                    }`}
                  >
                    <span className="opacity-40">{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {phase === 'completed' && finalResult && (
          <div className="text-center max-w-xl space-y-6 py-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas dark:bg-darkbg border border-hairline dark:border-hairline-dark text-[11px] font-mono text-ink-muted">
              <Award className="w-3.5 h-3.5 text-lacquer" />
              <span>TEST TERMINÉ</span>
            </div>

            <div>
              <span className="text-xs font-mono tracking-widest text-ink-muted uppercase block mb-1">
                SCORE D'EMPAN SÉQUENTIEL
              </span>
              <div className="text-6xl sm:text-7xl font-serif font-bold text-ink dark:text-canvas tracking-tight">
                {finalResult.score} <span className="text-2xl font-sans font-light text-ink-muted">paliers</span>
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
                <span className="text-ink dark:text-canvas">{meta.normativeMedian} paliers</span>
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
          <h4 className="font-serif text-sm font-semibold text-ink dark:text-canvas">Mémoire de Travail Spatiale</h4>
          <p className="text-ink-muted dark:text-ink-subtle leading-relaxed">
            La tâche évalue l'administrateur central et le calepin visuo-spatial (modèle de Baddeley &amp; Hitch). La capacité moyenne humaine est d'environ 7 à 9 éléments consécutifs.
          </p>
        </div>
      </div>
    </div>
  );
};
