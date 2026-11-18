import React, { useState } from 'react';
import { BenchmarkMetadata, BenchmarkResult } from '../../types/benchmark';
import { formatGradeLabel } from '../../utils/statistics';
import { playSineTone, playSuccessChime, playFailureDrone } from '../../utils/audio';
import { RotateCcw, Award, ChevronRight, Heart } from 'lucide-react';

interface ChimpTestProps {
  meta: BenchmarkMetadata;
  onRecordResult: (score: number) => BenchmarkResult;
  onBack: () => void;
}

type Phase = 'idle' | 'showing' | 'hidden' | 'completed';

const GRID_COLS = 8;
const GRID_ROWS = 5;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

export const ChimpTest: React.FC<ChimpTestProps> = ({ meta, onRecordResult, onBack }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [tileCount, setTileCount] = useState<number>(4); // starts with 4 numbers
  const [positions, setPositions] = useState<Map<number, number>>(new Map()); // cellIndex -> number (1..tileCount)
  const [nextExpected, setNextExpected] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [finalResult, setFinalResult] = useState<BenchmarkResult | null>(null);

  const spawnLevel = (count: number) => {
    // Pick `count` distinct cells from TOTAL_CELLS
    const cells = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
    // Shuffle
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    const selectedCells = cells.slice(0, count);
    const newPositions = new Map<number, number>();
    selectedCells.forEach((cellIdx, i) => {
      newPositions.set(cellIdx, i + 1); // 1, 2, ..., count
    });

    setPositions(newPositions);
    setNextExpected(1);
    setPhase('showing');
    playSineTone(440, 0.08, 0.1);
  };

  const startTest = () => {
    setLives(3);
    setTileCount(4);
    setFinalResult(null);
    spawnLevel(4);
  };

  const handleCellClick = (cellIndex: number) => {
    if (phase !== 'showing' && phase !== 'hidden') return;

    const cellNumber = positions.get(cellIndex);
    if (!cellNumber) return; // clicked empty cell

    if (cellNumber === nextExpected) {
      // Correct!
      playSineTone(440 + nextExpected * 40, 0.06, 0.1);

      if (nextExpected === 1) {
        // Upon clicking 1, hide all numbers!
        setPhase('hidden');
      }

      // Remove the clicked tile from the board
      const nextPositions = new Map(positions);
      nextPositions.delete(cellIndex);
      setPositions(nextPositions);

      const nextVal = nextExpected + 1;
      setNextExpected(nextVal);

      if (nextVal > tileCount) {
        // Level cleared!
        playSuccessChime();
        const nextCount = tileCount + 1;
        setTileCount(nextCount);
        setTimeout(() => {
          spawnLevel(nextCount);
        }, 500);
      }
    } else {
      // Mistake!
      playFailureDrone();
      const remainingLives = lives - 1;
      setLives(remainingLives);

      if (remainingLives <= 0) {
        // Game over
        const finalScore = tileCount;
        const res = onRecordResult(finalScore);
        setFinalResult(res);
        setPhase('completed');
      } else {
        // Retry same level with 1 less life
        setTimeout(() => {
          spawnLevel(tileCount);
        }, 600);
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
            <span className="text-ink-muted">STRIKES :</span>
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
            TUILES : <span className="font-bold text-ink dark:text-canvas">{tileCount}</span>
          </div>
        </div>
      </div>

      {/* Main Testing Surface */}
      <div className="w-full min-h-[480px] bg-canvas-pure dark:bg-darkbg-surface border border-hairline dark:border-hairline-dark p-4 sm:p-8 flex flex-col justify-center items-center">
        {phase === 'idle' && (
          <div className="text-center max-w-xl space-y-6">
            <span className="text-[11px] font-mono tracking-widest text-ink-muted uppercase block">
              ÉPREUVE NO. {meta.index} — {meta.domainName}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ink dark:text-canvas">
              {meta.title}
            </h2>
            <p className="text-sm font-sans text-ink-muted dark:text-ink-subtle leading-relaxed">
              {meta.summary} Des chiffres apparaissent sur la grille. Dès que vous cliquez sur le 1, tous les autres chiffres sont masqués. Retrouvez-les de mémoire dans l'ordre croissant (2, 3, 4...).
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

        {(phase === 'showing' || phase === 'hidden') && (
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="text-xs font-mono tracking-widest uppercase text-ink-muted">
              {phase === 'showing'
                ? 'CLIQUEZ SUR LE 1 POUR COMMENCER'
                : `SÉLECTIONNEZ LE NOMBRE ${nextExpected} (DE MÉMOIRE)`}
            </div>

            {/* Matrix Grid */}
            <div
              className="grid gap-1.5 p-3 bg-canvas dark:bg-darkbg border border-hairline dark:border-hairline-dark w-full max-w-2xl"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: TOTAL_CELLS }).map((_, cellIdx) => {
                const cellNumber = positions.get(cellIdx);
                const hasTile = cellNumber !== undefined;

                return (
                  <button
                    key={cellIdx}
                    disabled={!hasTile}
                    onClick={() => handleCellClick(cellIdx)}
                    className={`aspect-square border flex items-center justify-center font-mono text-sm sm:text-base font-semibold transition-all duration-100 ${
                      hasTile
                        ? phase === 'showing'
                          ? 'bg-canvas-pure dark:bg-darkbg-surface border-ink dark:border-canvas text-ink dark:text-canvas shadow-sm hover:scale-105'
                          : 'bg-ink dark:bg-canvas text-transparent border-ink dark:border-canvas shadow-sm hover:opacity-85'
                        : 'border-transparent cursor-default'
                    }`}
                  >
                    {hasTile && phase === 'showing' ? cellNumber : ''}
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
                EMPAN SPATIAL MAXIMAL (AYUMU)
              </span>
              <div className="text-6xl sm:text-7xl font-serif font-bold text-ink dark:text-canvas tracking-tight">
                {finalResult.score} <span className="text-2xl font-sans font-light text-ink-muted">tuiles</span>
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
                <span className="text-ink dark:text-canvas">{meta.normativeMedian} tuiles (Chimpanzé Ayumu : 9 en 0.5s)</span>
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
          <h4 className="font-serif text-sm font-semibold text-ink dark:text-canvas">Le Paradigme d'Ayumu (Université de Kyoto)</h4>
          <p className="text-ink-muted dark:text-ink-subtle leading-relaxed">
            Les travaux du Pr. Tetsuro Matsuzawa (2007) ont révélé que le jeune chimpanzé Ayumu surpasse les humains adultes en mémoire photographique immédiate (mémoire eidétique), étant capable de mémoriser et reproduire 9 chiffres affichés pendant seulement 210 millisecondes.
          </p>
        </div>
      </div>
    </div>
  );
};
