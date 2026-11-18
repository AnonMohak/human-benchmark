import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BenchmarkMetadata, BenchmarkResult } from '../../types/benchmark';
import { formatGradeLabel } from '../../utils/statistics';
import { playImpulseTone, playSuccessChime, playFailureDrone, playSineTone } from '../../utils/audio';
import { RotateCcw, Award, ChevronRight, Headphones } from 'lucide-react';

interface AudioReactionProps {
  meta: BenchmarkMetadata;
  onRecordResult: (score: number, trials: { trialIndex: number; value: number; valid: boolean }[]) => BenchmarkResult;
  onBack: () => void;
}

type Phase = 'idle' | 'waiting' | 'early' | 'stimulus' | 'result' | 'completed';

const TOTAL_TRIALS = 5;

export const AudioReaction: React.FC<AudioReactionProps> = ({ meta, onRecordResult, onBack }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentTrial, setCurrentTrial] = useState<number>(0);
  const [trials, setTrials] = useState<{ trialIndex: number; value: number; valid: boolean }[]>([]);
  const [lastLatency, setLastLatency] = useState<number | null>(null);
  const [finalResult, setFinalResult] = useState<BenchmarkResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanupTimer();
  }, []);

  const armStimulus = useCallback(() => {
    cleanupTimer();
    setPhase('waiting');
    playSineTone(440, 0.05, 0.05);

    // Random delay between 2000ms and 5000ms
    const delay = 2000 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setPhase('stimulus');
      startTimeRef.current = performance.now();
      playImpulseTone(880);
    }, delay);
  }, []);

  const startTest = () => {
    setTrials([]);
    setCurrentTrial(0);
    setFinalResult(null);
    setLastLatency(null);
    armStimulus();
  };

  const handleActuation = () => {
    if (phase === 'waiting') {
      cleanupTimer();
      setPhase('early');
      playFailureDrone();
    } else if (phase === 'stimulus') {
      const now = performance.now();
      const latency = Math.round(now - startTimeRef.current);
      playSineTone(1046.5, 0.08, 0.12); // High C

      const nextTrialNumber = currentTrial + 1;
      const updatedTrials = [...trials, { trialIndex: nextTrialNumber, value: latency, valid: true }];
      setTrials(updatedTrials);
      setLastLatency(latency);
      setCurrentTrial(nextTrialNumber);

      if (nextTrialNumber >= TOTAL_TRIALS) {
        const sum = updatedTrials.reduce((acc, t) => acc + t.value, 0);
        const average = Math.round(sum / TOTAL_TRIALS);
        const res = onRecordResult(average, updatedTrials);
        setFinalResult(res);
        setPhase('completed');
        playSuccessChime();
      } else {
        setPhase('result');
      }
    } else if (phase === 'early' || phase === 'result') {
      armStimulus();
    }
  };

  // Spacebar hotkey actuation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'idle' || phase === 'completed') {
          startTest();
        } else {
          handleActuation();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentTrial, trials]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Breadcrumb & Metadata */}
      <div className="flex justify-between items-center pb-4 border-b border-hairline dark:border-hairline-dark mb-6">
        <div className="flex items-center space-x-3 text-xs font-mono text-ink-muted">
          <span>CATALOGUE // {meta.index}</span>
          <span>/</span>
          <span className="text-ink dark:text-canvas font-semibold">{meta.catalogName}</span>
        </div>
        <div className="text-xs font-mono text-ink-muted">
          ESSAI : {Math.min(currentTrial + (phase === 'stimulus' || phase === 'waiting' ? 1 : 0), TOTAL_TRIALS)} / {TOTAL_TRIALS}
        </div>
      </div>

      {/* Main Testing Surface */}
      <div
        onClick={phase !== 'idle' && phase !== 'completed' ? handleActuation : undefined}
        className={`w-full min-h-[460px] select-none flex flex-col justify-center items-center p-8 transition-colors duration-150 cursor-pointer border ${
          phase === 'waiting'
            ? 'bg-ink text-canvas border-ink dark:bg-canvas dark:text-ink'
            : phase === 'stimulus'
            ? 'bg-botanical border-botanical text-white'
            : phase === 'early'
            ? 'bg-ochre border-ochre text-ink'
            : 'bg-canvas-pure dark:bg-darkbg-surface border-hairline dark:border-hairline-dark text-ink dark:text-canvas'
        }`}
      >
        {phase === 'idle' && (
          <div className="text-center max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas dark:bg-darkbg border border-hairline dark:border-hairline-dark text-[11px] font-mono text-ink-muted">
              <Headphones className="w-3.5 h-3.5 text-lacquer" />
              <span>TRANSDUCTION ACOUSTIQUE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              {meta.title}
            </h2>
            <p className="text-sm font-sans text-ink-muted dark:text-ink-subtle leading-relaxed">
              {meta.summary} Gardez vos écouteurs allumés. L'écran reste sombre et sans indice visuel. Cliquez immédiatement dès l'émission de l'impulsion sonore à 880 Hz.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={startTest}
                className="px-8 py-3 bg-ink text-canvas dark:bg-canvas dark:text-ink font-mono text-xs tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <span>INITIER L’ÉPREUVE</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-ink-muted">OU [ESPACE]</span>
            </div>
          </div>
        )}

        {phase === 'waiting' && (
          <div className="text-center space-y-4 pointer-events-none">
            <span className="text-xs font-mono tracking-widest uppercase opacity-75">CANAL AUDITIF EN ATTENTE</span>
            <div className="w-16 h-16 mx-auto rounded-full border border-current flex items-center justify-center animate-pulse">
              <Headphones className="w-7 h-7" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-medium">
              Écoutez attentivement...
            </h3>
            <p className="text-xs font-sans opacity-75">Cliquez dès le déclenchement de la tonalité.</p>
          </div>
        )}

        {phase === 'stimulus' && (
          <div className="text-center space-y-3 pointer-events-none">
            <span className="text-xs font-mono tracking-widest uppercase opacity-90">IMPULSION ÉMISE (880 HZ)</span>
            <h3 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight">
              CLIQUEZ !
            </h3>
            <p className="text-xs font-sans opacity-90">Actuation motrice immédiate...</p>
          </div>
        )}

        {phase === 'early' && (
          <div className="text-center space-y-4 max-w-md">
            <span className="text-xs font-mono tracking-widest uppercase font-semibold text-lacquer">ANTICIPATION AUDITIVE</span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
              Clic anticipé !
            </h3>
            <p className="text-xs font-sans text-ink-muted">
              Aucune impulsion acoustique n'avait encore été délivrée.
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-2 bg-ink text-canvas font-mono text-xs tracking-wider uppercase">
                Cliquez pour réarmer
              </span>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="text-center space-y-4 max-w-md">
            <span className="text-xs font-mono tracking-widest uppercase text-ink-muted">TEMPS DE RÉACTION AUDITIF</span>
            <div className="text-5xl sm:text-6xl font-serif font-bold tracking-tight text-ink dark:text-canvas">
              {lastLatency} <span className="text-xl font-sans font-normal text-ink-muted">ms</span>
            </div>
            <p className="text-xs font-sans text-ink-muted dark:text-ink-subtle">
              Essai {currentTrial} sur {TOTAL_TRIALS} consigné.
            </p>
            <div className="pt-2">
              <span className="inline-block px-6 py-2.5 bg-ink dark:bg-canvas text-canvas dark:text-ink font-mono text-xs tracking-widest uppercase">
                Cliquez pour continuer
              </span>
            </div>
          </div>
        )}

        {phase === 'completed' && finalResult && (
          <div className="text-center max-w-xl space-y-6 py-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas dark:bg-darkbg border border-hairline dark:border-hairline-dark text-[11px] font-mono text-ink-muted">
              <Award className="w-3.5 h-3.5 text-lacquer" />
              <span>RÉSULTAT HOMOLOGUÉ</span>
            </div>

            <div>
              <span className="text-xs font-mono tracking-widest text-ink-muted uppercase block mb-1">
                LATENCE AUDITIVE MOYENNE
              </span>
              <div className="text-6xl sm:text-7xl font-serif font-bold text-ink dark:text-canvas tracking-tight">
                {finalResult.score} <span className="text-2xl font-sans font-light text-ink-muted">ms</span>
              </div>
            </div>

            <div className="border border-hairline dark:border-hairline-dark divide-y divide-hairline dark:divide-hairline-dark text-xs font-mono max-w-sm mx-auto">
              <div className="grid grid-cols-2 py-1.5 px-3 bg-canvas-subtle dark:bg-darkbg text-[10px] text-ink-muted uppercase">
                <span>ESSAI</span>
                <span className="text-right">TEMPS MESURÉ</span>
              </div>
              {trials.map((t, idx) => (
                <div key={idx} className="grid grid-cols-2 py-1.5 px-3">
                  <span>Essai {t.trialIndex}</span>
                  <span className="text-right font-medium">{t.value} ms</span>
                </div>
              ))}
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
                <span>RÉITÉRER L'ÉPREUVE</span>
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
          <h4 className="font-serif text-sm font-semibold text-ink dark:text-canvas">Neurophysiologie Auditive</h4>
          <p className="text-ink-muted dark:text-ink-subtle leading-relaxed">
            La voie auditive (cochlée → noyaux cochléaires → colliculus inférieur → cortex auditif) traite les signaux mécaniques en environ 8 à 10 ms, soit 20 à 40 ms plus rapidement que la photo-transduction rétinienne chimique. Le temps de réaction humain médian est donc de ~182 ms.
          </p>
        </div>
      </div>
    </div>
  );
};
