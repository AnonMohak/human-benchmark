import React, { useState, useRef } from 'react';
import { BenchmarkMetadata, BenchmarkResult } from '../../types/benchmark';
import { formatGradeLabel } from '../../utils/statistics';
import { playSineTone, playSuccessChime, playFailureDrone } from '../../utils/audio';
import { RotateCcw, Award, ChevronRight } from 'lucide-react';

interface StroopTestProps {
  meta: BenchmarkMetadata;
  onRecordResult: (score: number, trials: { trialIndex: number; value: number; valid: boolean }[]) => BenchmarkResult;
  onBack: () => void;
}

interface ColorDef {
  label: string;
  name: string;
  hex: string;
}

const COLORS: ColorDef[] = [
  { label: 'ROUGE', name: 'RED', hex: '#B42B24' },
  { label: 'BLEU', name: 'BLUE', hex: '#1D4ED8' },
  { label: 'VERT', name: 'GREEN', hex: '#275B41' },
  { label: 'JAUNE', name: 'YELLOW', hex: '#D97706' }
];

const TOTAL_TRIALS = 20;

export const StroopTest: React.FC<StroopTestProps> = ({ meta, onRecordResult, onBack }) => {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<ColorDef>(COLORS[0]);
  const [currentInk, setCurrentInk] = useState<ColorDef>(COLORS[1]);
  const [latencies, setLatencies] = useState<{ trialIndex: number; value: number; valid: boolean }[]>([]);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [finalResult, setFinalResult] = useState<BenchmarkResult | null>(null);

  const trialStartTimeRef = useRef<number>(0);

  const spawnNextStimulus = () => {
    // 70% chance incongruent, 30% congruent
    const wordIdx = Math.floor(Math.random() * COLORS.length);
    let inkIdx = Math.floor(Math.random() * COLORS.length);

    if (Math.random() < 0.7) {
      while (inkIdx === wordIdx) {
        inkIdx = Math.floor(Math.random() * COLORS.length);
      }
    }

    setCurrentWord(COLORS[wordIdx]);
    setCurrentInk(COLORS[inkIdx]);
    trialStartTimeRef.current = performance.now();
  };

  const startTest = () => {
    setLatencies([]);
    setErrorCount(0);
    setTrialIndex(0);
    setFinalResult(null);
    setPhase('playing');
    spawnNextStimulus();
    playSineTone(440, 0.08, 0.1);
  };

  const handleColorChoice = (chosenInk: ColorDef) => {
    if (phase !== 'playing') return;

    const now = performance.now();
    const duration = Math.round(now - trialStartTimeRef.current);
    const isCorrect = chosenInk.name === currentInk.name;

    const penaltyDuration = isCorrect ? duration : duration + 400; // 400ms penalty for mistake
    if (!isCorrect) {
      setErrorCount((prev) => prev + 1);
      playFailureDrone();
    } else {
      playSineTone(600, 0.05, 0.1);
    }

    const nextIndex = trialIndex + 1;
    const updatedTrials = [
      ...latencies,
      { trialIndex: nextIndex, value: penaltyDuration, valid: isCorrect }
    ];
    setLatencies(updatedTrials);
    setTrialIndex(nextIndex);

    if (nextIndex >= TOTAL_TRIALS) {
      // Completed all 20 trials
      const sum = updatedTrials.reduce((acc, t) => acc + t.value, 0);
      const averageLatency = Math.round(sum / TOTAL_TRIALS);

      const res = onRecordResult(averageLatency, updatedTrials);
      setFinalResult(res);
      setPhase('completed');
      playSuccessChime();
    } else {
      spawnNextStimulus();
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
          ESSAI : <span className="font-bold text-ink dark:text-canvas">{trialIndex + 1}</span> / {TOTAL_TRIALS}
        </div>
      </div>

      {/* Main Testing Surface */}
      <div className="w-full min-h-[460px] bg-canvas-pure dark:bg-darkbg-surface border border-hairline dark:border-hairline-dark p-8 flex flex-col justify-center items-center">
        {phase === 'idle' && (
          <div className="text-center max-w-xl space-y-6">
            <span className="text-[11px] font-mono tracking-widest text-ink-muted uppercase block">
              ÉPREUVE NO. {meta.index} — {meta.domainName}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ink dark:text-canvas">
              {meta.title}
            </h2>
            <p className="text-sm font-sans text-ink-muted dark:text-ink-subtle leading-relaxed">
              {meta.summary} Sélectionnez la COULEUR DE L'ENCRE des lettres ci-dessous, en ignorant la signification textuelle du mot écrit. 20 essais testeront votre capacité d'inhibition préfrontale.
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
          <div className="text-center max-w-lg w-full space-y-10">
            <span className="text-xs font-mono tracking-widest uppercase text-ink-muted block">
              INDICATION : CLIQUEZ SUR LA COULEUR DE L'ENCRE
            </span>

            {/* Stimulus Word */}
            <div
              style={{ color: currentInk.hex }}
              className="text-6xl sm:text-7xl font-serif font-bold tracking-widest select-none py-6 transition-all"
            >
              {currentWord.label}
            </div>

            {/* Color Choice Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {COLORS.map((col) => (
                <button
                  key={col.name}
                  onClick={() => handleColorChoice(col)}
                  className="py-3 px-4 border border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas font-mono text-xs tracking-wider uppercase bg-canvas dark:bg-darkbg hover:bg-canvas-subtle transition-all flex items-center justify-center gap-2"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.label}</span>
                </button>
              ))}
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
                LATENCE MOYENNE D'INHIBITION
              </span>
              <div className="text-6xl sm:text-7xl font-serif font-bold text-ink dark:text-canvas tracking-tight">
                {finalResult.score} <span className="text-2xl font-sans font-light text-ink-muted">ms</span>
              </div>
            </div>

            <div className="p-4 bg-canvas dark:bg-darkbg border border-hairline dark:border-hairline-dark max-w-md mx-auto space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-ink-muted uppercase">ERREURS D'INHIBITION :</span>
                <span className="font-bold text-ink dark:text-canvas">{errorCount} / {TOTAL_TRIALS}</span>
              </div>
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
          <h4 className="font-serif text-sm font-semibold text-ink dark:text-canvas">L'Effet Stroop (John Ridley Stroop, 1935)</h4>
          <p className="text-ink-muted dark:text-ink-subtle leading-relaxed">
            La lecture de mots est un automatisme cognitif si ancré qu'inhiber son sens pour nommer la couleur d'impression physique nécessite un effort actif du cortex cingulaire antérieur et du cortex préfrontal dorsolatéral.
          </p>
        </div>
      </div>
    </div>
  );
};
