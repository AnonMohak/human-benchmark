import React, { useState, useEffect, useRef } from 'react';
import { BenchmarkMetadata, BenchmarkResult } from '../../types/benchmark';
import { formatGradeLabel } from '../../utils/statistics';
import { playSineTone, playFailureDrone } from '../../utils/audio';
import { RotateCcw, Award, ChevronRight } from 'lucide-react';

interface NumberMemoryProps {
  meta: BenchmarkMetadata;
  onRecordResult: (score: number) => BenchmarkResult;
  onBack: () => void;
}

type Phase = 'idle' | 'showing' | 'input' | 'incorrect' | 'completed';

export const NumberMemory: React.FC<NumberMemoryProps> = ({ meta, onRecordResult, onBack }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [level, setLevel] = useState<number>(3); // starts with 3 digits
  const [currentNumber, setCurrentNumber] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [finalResult, setFinalResult] = useState<BenchmarkResult | null>(null);
  const [progressWidth, setProgressWidth] = useState<number>(100);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const cleanup = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  const generateNumber = (digitsCount: number): string => {
    // Generate N random digits, first digit non-zero
    let str = (Math.floor(Math.random() * 9) + 1).toString();
    for (let i = 1; i < digitsCount; i++) {
      str += Math.floor(Math.random() * 10).toString();
    }
    return str;
  };

  const startRound = (digitsCount: number) => {
    cleanup();
    const num = generateNumber(digitsCount);
    setCurrentNumber(num);
    setUserInput('');
    setPhase('showing');
    setProgressWidth(100);
    playSineTone(440, 0.08, 0.1);

    // Duration scales with number length: base 1200ms + 600ms per digit
    const duration = 1200 + digitsCount * 600;
    const intervalTick = 50;
    const step = 100 / (duration / intervalTick);

    progressIntervalRef.current = setInterval(() => {
      setProgressWidth((prev) => Math.max(0, prev - step));
    }, intervalTick);

    timerRef.current = setTimeout(() => {
      cleanup();
      setPhase('input');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }, duration);
  };

  const startTest = () => {
    setLevel(3);
    setFinalResult(null);
    startRound(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'input') return;

    if (userInput.trim() === currentNumber) {
      // Correct!
      playSineTone(659.25, 0.09, 0.12);
      const nextLevel = level + 1;
      setLevel(nextLevel);
      startRound(nextLevel);
    } else {
      // Failed!
      cleanup();
      playFailureDrone();
      const finalScore = level - 1; // score is the last successfully remembered digit count
      const res = onRecordResult(Math.max(1, finalScore));
      setFinalResult(res);
      setPhase('incorrect');
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
          CHIFFRES : <span className="font-bold text-ink dark:text-canvas">{level}</span>
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
              {meta.summary} Une suite de chiffres apparaît pendant quelques secondes. Retenez-la et saisissez-la exactement. Chaque succès allonge la série d'un chiffre supplémentaire.
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

        {phase === 'showing' && (
          <div className="text-center max-w-md w-full space-y-8">
            <span className="text-xs font-mono tracking-widest uppercase text-ink-muted">
              MÉMORISEZ LA SÉRIE NUMÉRIQUE ({level} CHIFFRES)
            </span>

            <div className="text-5xl sm:text-6xl font-serif font-bold tracking-widest text-ink dark:text-canvas py-4 font-mono select-none">
              {currentNumber}
            </div>

            {/* Countdown progress hairline */}
            <div className="w-full h-1 bg-hairline dark:bg-hairline-dark overflow-hidden">
              <div
                className="h-full bg-ink dark:bg-canvas transition-all duration-75"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        )}

        {phase === 'input' && (
          <form onSubmit={handleSubmit} className="text-center max-w-md w-full space-y-6">
            <span className="text-xs font-mono tracking-widest uppercase text-ink-muted">
              SAISISSEZ LE NOMBRE DU SOUVENIR
            </span>

            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 842"
              className="w-full text-center text-4xl sm:text-5xl font-mono tracking-widest py-3 px-4 bg-canvas dark:bg-darkbg border-2 border-hairline dark:border-hairline-dark focus:border-ink dark:focus:border-canvas outline-none transition-colors text-ink dark:text-canvas"
            />

            <button
              type="submit"
              className="w-full py-3 bg-ink text-canvas dark:bg-canvas dark:text-ink font-mono text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              VALIDER LA SAISIE // [ENTRÉE]
            </button>
          </form>
        )}

        {phase === 'incorrect' && finalResult && (
          <div className="text-center max-w-xl space-y-6 py-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas dark:bg-darkbg border border-hairline dark:border-hairline-dark text-[11px] font-mono text-ink-muted">
              <Award className="w-3.5 h-3.5 text-lacquer" />
              <span>TEST TERMINÉ</span>
            </div>

            <div>
              <span className="text-xs font-mono tracking-widest text-ink-muted uppercase block mb-1">
                EMPAN NUMÉRIQUE MAXIMUM ATTEINT
              </span>
              <div className="text-6xl sm:text-7xl font-serif font-bold text-ink dark:text-canvas tracking-tight">
                {finalResult.score} <span className="text-2xl font-sans font-light text-ink-muted">chiffres</span>
              </div>
            </div>

            {/* Error Diff Inspection */}
            <div className="p-4 bg-canvas dark:bg-darkbg border border-hairline dark:border-hairline-dark max-w-md mx-auto space-y-2 text-left font-mono text-xs">
              <div className="flex justify-between border-b border-hairline dark:border-hairline-dark pb-1 text-[10px] text-ink-muted uppercase">
                <span>VALEUR ATTENDUE :</span>
                <span className="tracking-widest font-bold text-botanical">{currentNumber}</span>
              </div>
              <div className="flex justify-between text-[10px] text-ink-muted uppercase">
                <span>VOTRE RÉPONSE :</span>
                <span className="tracking-widest font-bold text-lacquer">{userInput || '(vide)'}</span>
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
                <span className="text-ink dark:text-canvas">{meta.normativeMedian} chiffres (loi de Miller)</span>
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
          <h4 className="font-serif text-sm font-semibold text-ink dark:text-canvas">Loi du Nombre Magique de Miller</h4>
          <p className="text-ink-muted dark:text-ink-subtle leading-relaxed">
            En 1956, George A. Miller formula la loi du « nombre magique 7 ± 2 » pour la mémoire immédiate humaine. L'empan moyen sans stratégie de segmentation (chunking) est de 7 chiffres, oscillant entre 5 et 9 selon les sujets.
          </p>
        </div>
      </div>
    </div>
  );
};
