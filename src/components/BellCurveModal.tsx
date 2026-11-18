import React from 'react';
import { BenchmarkMetadata, BenchmarkStoreData } from '../types/benchmark';
import { calculatePercentile, formatGradeLabel, generateDistributionCurve, getCognitiveGrade } from '../utils/statistics';
import { X } from 'lucide-react';

interface BellCurveModalProps {
  benchmark: BenchmarkMetadata | null;
  store: BenchmarkStoreData;
  onClose: () => void;
}

export const BellCurveModal: React.FC<BellCurveModalProps> = ({ benchmark, store, onClose }) => {
  if (!benchmark) return null;

  const stats = store[benchmark.id];
  const userScore = stats?.bestScore ?? null;
  const percentile = userScore !== null
    ? calculatePercentile(userScore, benchmark.normativeMedian, benchmark.normativeStdDev, benchmark.higherIsBetter)
    : null;
  const grade = percentile !== null ? getCognitiveGrade(percentile) : null;

  const curvePoints = generateDistributionCurve(benchmark.normativeMedian, benchmark.normativeStdDev, userScore, 80);

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingBottom = 40;
  const paddingTop = 20;

  const minX = curvePoints[0].x;
  const maxX = curvePoints[curvePoints.length - 1].x;

  const scaleX = (xVal: number) => {
    return paddingX + ((xVal - minX) / (maxX - minX)) * (svgWidth - 2 * paddingX);
  };

  const scaleY = (yVal: number) => {
    return svgHeight - paddingBottom - yVal * (svgHeight - paddingBottom - paddingTop);
  };

  const pathData = curvePoints.reduce((acc, pt, i) => {
    const sx = scaleX(pt.x);
    const sy = scaleY(pt.y);
    return `${acc} ${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
  }, '');

  const userSvgX = userScore !== null ? Math.max(paddingX, Math.min(svgWidth - paddingX, scaleX(userScore))) : null;
  const medianSvgX = scaleX(benchmark.normativeMedian);

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-canvas dark:bg-darkbg-surface border border-hairline dark:border-hairline-dark max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 border border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas text-ink-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-ink-muted uppercase">
            DISTRIBUTION NORMÉE GAUSSIENNE // ÉPREUVE {benchmark.index}
          </span>
          <h3 className="text-2xl font-serif font-bold text-ink dark:text-canvas">
            {benchmark.title}
          </h3>
          <p className="text-xs text-ink-muted">
            Représentation de la fonction de densité de probabilité normale $N(\mu, \sigma^2)$ sur la population générale.
          </p>
        </div>

        {/* SVG Bell Curve */}
        <div className="border border-hairline dark:border-hairline-dark p-4 bg-canvas-pure dark:bg-darkbg">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
            {/* Grid baseline */}
            <line
              x1={paddingX}
              y1={svgHeight - paddingBottom}
              x2={svgWidth - paddingX}
              y2={svgHeight - paddingBottom}
              stroke="currentColor"
              className="text-hairline dark:text-hairline-dark"
              strokeWidth="1"
            />

            {/* Bell Curve Stroke */}
            <path
              d={pathData}
              fill="none"
              stroke="currentColor"
              className="text-ink dark:text-canvas"
              strokeWidth="2"
            />

            {/* Population Median Marker */}
            <line
              x1={medianSvgX}
              y1={paddingTop}
              x2={medianSvgX}
              y2={svgHeight - paddingBottom}
              stroke="currentColor"
              className="text-ink-subtle"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={medianSvgX}
              y={svgHeight - 15}
              textAnchor="middle"
              className="text-[9px] font-mono fill-current text-ink-muted"
            >
              μ = {benchmark.normativeMedian} {benchmark.unit}
            </text>

            {/* User Score Marker */}
            {userSvgX !== null && (
              <>
                <line
                  x1={userSvgX}
                  y1={paddingTop}
                  x2={userSvgX}
                  y2={svgHeight - paddingBottom}
                  stroke="#B42B24"
                  strokeWidth="2"
                />
                <circle cx={userSvgX} cy={paddingTop + 10} r="4" fill="#B42B24" />
                <text
                  x={userSvgX}
                  y={svgHeight - 2}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-bold fill-current text-lacquer"
                >
                  VOUS: {userScore} {benchmark.unit}
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Summary Details */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-hairline dark:border-hairline-dark pt-4">
          <div>
            <span className="text-[10px] text-ink-muted uppercase block">MÉDIANE NORMÉE (μ)</span>
            <span className="text-sm font-bold text-ink dark:text-canvas">
              {benchmark.normativeMedian} {benchmark.unit}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-ink-muted uppercase block">ÉCART-TYPE (σ)</span>
            <span className="text-sm font-bold text-ink dark:text-canvas">
              ±{benchmark.normativeStdDev} {benchmark.unit}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-ink-muted uppercase block">VOTRE RECORD</span>
            <span className="text-sm font-bold text-ink dark:text-canvas">
              {userScore !== null ? `${userScore} ${benchmark.unit}` : 'Non consigné'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-ink-muted uppercase block">RANG PERCENTILE</span>
            <span className="text-sm font-bold text-botanical">
              {percentile !== null ? `${percentile}% (${formatGradeLabel(grade!)})` : '—'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-ink text-canvas dark:bg-canvas dark:text-ink font-mono text-xs tracking-widest uppercase hover:opacity-90"
        >
          FERMER LA MODALE
        </button>
      </div>
    </div>
  );
};
