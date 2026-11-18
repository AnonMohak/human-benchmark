import React, { useState } from 'react';
import { BenchmarkMetadata, BenchmarkResult } from '../../types/benchmark';
import { formatGradeLabel } from '../../utils/statistics';
import { playSineTone, playFailureDrone } from '../../utils/audio';
import { RotateCcw, Award, ChevronRight, Heart } from 'lucide-react';

interface VerbalMemoryProps {
  meta: BenchmarkMetadata;
  onRecordResult: (score: number) => BenchmarkResult;
  onBack: () => void;
}

const WORD_BANK = [
  'ARCHITECTURE', 'SYMMETRY', 'EPISTEMIC', 'PARADIGM', 'CHRONOMETER', 'MERIDIAN',
  'CATALOGUE', 'AESTHETIC', 'PROVENANCE', 'TYPOGRAPHY', 'SERIF', 'MONOCHROME',
  'CARTOGRAPHY', 'ARCHIVE', 'INTERVAL', 'CADENCE', 'HARMONIC', 'PRECISION',
  'HERITAGE', 'TEXTURE', 'PROPORTION', 'ELEGANCE', 'STRUCTURE', 'GEOMETRY',
  'LATENCY', 'FREQUENCY', 'AXIOM', 'CANONICAL', 'SYNTACTIC', 'DISCIPLINES',
  'FOUNDATION', 'METROLOGY', 'SPECTRUM', 'FACILITY', 'CHRONOMETRY', 'TEMPORAL',
  'LUMINESCENCE', 'EQUILIBRIUM', 'SILHOUETTE', 'COMPASS', 'CONTINUUM', 'VANGUARD',
  'TACTILE', 'IMPRESSION', 'PRISMATIC', 'ARTIFACT', 'VERACITY', 'COORDINATE',
  'PHENOMENON', 'SEMAPHORE', 'ORBIT', 'TERRITORY', 'SOLITUDE', 'REFRACTION',
  'MONOGRAPH', 'BALANCE', 'VIBRATION', 'MEASURE', 'DIALECTIC', 'PERSPECTIVE',
  'ENGRAVING', 'HORIZON', 'SYLLABLE', 'METAPHOR', 'ALTITUDE', 'FOLIO',
  'COMPOSITION', 'INTAGLIO', 'VELLUM', 'PARCHMENT', 'REGISTER', 'MONUMENT',
  'QUARRY', 'BASALT', 'TRAVERTINE', 'LIMESTONE', 'TERRAZZO', 'CONCRETE',
  'FACADE', 'ARCHITRAVE', 'COLONNADE', 'PORTICO', 'PEDIMENT', 'ATRIUM',
  'CLOISTER', 'CORBEL', 'VAULT', 'CUPOLA', 'APSE', 'NAVE',
  'TRANSOM', 'PILASTER', 'CORNICE', 'FRIEZE', 'ENTABLATURE', 'STYLOBATE',
  'VOLUTE', 'MODILLION', 'PLINTH', 'KEYSTONE', 'ARCH', 'CANTILEVER',
  'BUTTRESS', 'OCTAGON', 'PARABOLA', 'HYPERBOLA', 'ELLIPSE', 'SPIRAL',
  'FRACTAL', 'HELIX', 'TESSELLATION', 'ISOMETRY', 'AFFINE', 'CHIRALITY',
  'GRADIENT', 'CHROMA', 'OPACITY', 'SATURATION', 'LUMINANCE', 'CONTRAST',
  'HALO', 'SHADOW', 'TINT', 'SHADE', 'HUE', 'PIGMENT',
  'COCHINEAL', 'LAPIS', 'OCHRE', 'VERMILION', 'SIENNA', 'UMBER',
  'CHARCOAL', 'BISMUTH', 'GRAPHITE', 'PLATINUM', 'TITANIUM', 'OBSIDIAN'
];

type Phase = 'idle' | 'playing' | 'completed';

export const VerbalMemory: React.FC<VerbalMemoryProps> = ({ meta, onRecordResult, onBack }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  const [finalResult, setFinalResult] = useState<BenchmarkResult | null>(null);

  const pickNextWord = (seenSet: Set<string>) => {
    // 50% chance to pick a seen word (if seen set has words), 50% chance new
    const shouldPickSeen = seenSet.size > 2 && Math.random() < 0.5;

    if (shouldPickSeen) {
      const seenArr = Array.from(seenSet);
      const chosen = seenArr[Math.floor(Math.random() * seenArr.length)];
      setCurrentWord(chosen);
    } else {
      // Pick a word not yet in seenSet
      const unseen = WORD_BANK.filter((w) => !seenSet.has(w));
      if (unseen.length === 0) {
        // Fallback if exhausted
        const chosen = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
        setCurrentWord(chosen);
      } else {
        const chosen = unseen[Math.floor(Math.random() * unseen.length)];
        setCurrentWord(chosen);
      }
    }
  };

  const startTest = () => {
    const initialSet = new Set<string>();
    setSeenWords(initialSet);
    setScore(0);
    setLives(3);
    setFinalResult(null);
    setPhase('playing');
    pickNextWord(initialSet);
    playSineTone(440, 0.08, 0.1);
  };

  const handleChoice = (choice: 'SEEN' | 'NEW') => {
    if (phase !== 'playing') return;

    const isActuallySeen = seenWords.has(currentWord);
    const correct = (choice === 'SEEN' && isActuallySeen) || (choice === 'NEW' && !isActuallySeen);

    if (correct) {
      playSineTone(587.33, 0.06, 0.1);
      const nextScore = score + 1;
      setScore(nextScore);

      const nextSeen = new Set(seenWords);
      nextSeen.add(currentWord);
      setSeenWords(nextSeen);
      pickNextWord(nextSeen);
    } else {
      playFailureDrone();
      const remainingLives = lives - 1;
      setLives(remainingLives);

      if (remainingLives <= 0) {
        // Game Over
        const res = onRecordResult(score);
        setFinalResult(res);
        setPhase('completed');
        playFailureDrone();
      } else {
        const nextSeen = new Set(seenWords);
        nextSeen.add(currentWord);
        setSeenWords(nextSeen);
        pickNextWord(nextSeen);
      }
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
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1">
            <span className="text-ink-muted">VIES :</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < lives ? 'text-lacquer fill-lacquer' : 'text-ink-subtle opacity-30'
                }`}
              />
            ))}
          </div>
          <div>
            SCORE : <span className="font-bold text-ink dark:text-canvas">{score}</span>
          </div>
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
              {meta.summary} Des mots vous sont présentés un par un. Indiquez si le mot a DÉJÀ ÉTÉ VU ou s'il s'agit d'un NOUVEAU mot. Vous disposez de 3 vies.
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
          <div className="text-center max-w-lg space-y-8">
            <span className="text-xs font-mono tracking-widest uppercase text-ink-muted">
              TERME LEXICAL PRÉSENTÉ
            </span>

            <div className="text-4xl sm:text-5xl font-serif font-bold text-ink dark:text-canvas tracking-wider py-4 select-none">
              {currentWord}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => handleChoice('SEEN')}
                className="py-4 px-6 border-2 border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas font-mono text-xs tracking-widest uppercase text-ink dark:text-canvas bg-canvas dark:bg-darkbg hover:bg-canvas-subtle transition-all"
              >
                DÉJÀ VU // SEEN
              </button>

              <button
                onClick={() => handleChoice('NEW')}
                className="py-4 px-6 border-2 border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas font-mono text-xs tracking-widest uppercase text-ink dark:text-canvas bg-canvas dark:bg-darkbg hover:bg-canvas-subtle transition-all"
              >
                NOUVEAU // NEW
              </button>
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
                MOTS CORRECTEMENT IDENTIFIÉS
              </span>
              <div className="text-6xl sm:text-7xl font-serif font-bold text-ink dark:text-canvas tracking-tight">
                {finalResult.score} <span className="text-2xl font-sans font-light text-ink-muted">mots</span>
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
                <span className="text-ink dark:text-canvas">{meta.normativeMedian} mots</span>
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
          <h4 className="font-serif text-sm font-semibold text-ink dark:text-canvas">Charge Cognitive &amp; Reconnaissance</h4>
          <p className="text-ink-muted dark:text-ink-subtle leading-relaxed">
            La mémoire de reconnaissance verbale sollicite le lobe temporal médian et l'hippocampe. La discrimination entre ancien et nouveau teste la précision des traces mnésiques face aux interférences proactives.
          </p>
        </div>
      </div>
    </div>
  );
};
