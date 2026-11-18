import React, { useState } from 'react';
import { BenchmarkCategory, BenchmarkId, BenchmarkMetadata, BenchmarkStoreData } from '../types/benchmark';
import { BENCHMARKS_CATALOG } from '../data/benchmarks';
import { calculatePercentile, formatGradeLabel, getCognitiveGrade } from '../utils/statistics';
import { ArrowUpRight, BarChart2, CheckCircle2, Circle } from 'lucide-react';

interface CatalogTableProps {
  store: BenchmarkStoreData;
  onSelectBenchmark: (id: BenchmarkId) => void;
  onInspectDistribution: (benchmark: BenchmarkMetadata) => void;
}

export const CatalogTable: React.FC<CatalogTableProps> = ({
  store,
  onSelectBenchmark,
  onInspectDistribution
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BenchmarkCategory | 'all'>('all');

  const filteredBenchmarks = BENCHMARKS_CATALOG.filter((b) => {
    if (selectedCategory === 'all') return true;
    return b.category === selectedCategory;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Editorial Headline & Category Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-hairline dark:border-hairline-dark">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-ink-muted uppercase">
            CATALOGUE DES ÉPREUVES // SÉRIE OFFICIELLE
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ink dark:text-canvas">
            Index des Disciplines Psychométriques
          </h2>
          <p className="text-xs font-sans text-ink-muted dark:text-ink-subtle max-w-xl">
            Batterie de tests neuro-cognitifs standardisés mesurant la réactivité synaptique, la rétention mnésique et le contrôle inhibiteur.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1 border border-hairline dark:border-hairline-dark p-1 bg-canvas-pure dark:bg-darkbg-surface font-mono text-xs">
          {[
            { id: 'all', label: 'TOUTES // 08' },
            { id: 'reflex', label: 'RÉFLEXES' },
            { id: 'memory', label: 'MÉMOIRE' },
            { id: 'spatial', label: 'SPATIAL' },
            { id: 'executive', label: 'EXÉCUTIF' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as BenchmarkCategory | 'all')}
              className={`px-3 py-1 text-[11px] tracking-wider uppercase transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-ink text-canvas dark:bg-canvas dark:text-ink font-semibold'
                  : 'text-ink-muted hover:text-ink dark:hover:text-canvas'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editorial Swiss Grid Table */}
      <div className="mt-6 border border-hairline dark:border-hairline-dark overflow-x-auto bg-canvas-pure dark:bg-darkbg-surface">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-hairline dark:border-hairline-dark bg-canvas-subtle dark:bg-darkbg text-[10px] font-mono tracking-widest text-ink-muted uppercase">
              <th className="py-3 px-4 w-16">NO.</th>
              <th className="py-3 px-4">DISCIPLINE &amp; PROTOCOLE</th>
              <th className="py-3 px-4 hidden md:table-cell">CATÉGORIE</th>
              <th className="py-3 px-4 text-right">MÉDIANE NORMÉE</th>
              <th className="py-3 px-4 text-right">RECORD PERSONNEL</th>
              <th className="py-3 px-4 text-right hidden sm:table-cell">PERCENTILE</th>
              <th className="py-3 px-4 text-center w-28">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline dark:divide-hairline-dark">
            {filteredBenchmarks.map((b) => {
              const stats = store[b.id];
              const hasScore = stats && stats.bestScore !== null;
              const percentile = hasScore
                ? calculatePercentile(stats.bestScore!, b.normativeMedian, b.normativeStdDev, b.higherIsBetter)
                : null;
              const grade = percentile !== null ? getCognitiveGrade(percentile) : null;

              return (
                <tr
                  key={b.id}
                  onClick={() => onSelectBenchmark(b.id)}
                  className="group hover:bg-canvas-subtle dark:hover:bg-darkbg-elevated transition-colors cursor-pointer"
                >
                  {/* Number index */}
                  <td className="py-4 px-4 font-mono text-ink-muted group-hover:text-ink dark:group-hover:text-canvas">
                    {b.index}
                  </td>

                  {/* Title and summary */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm font-semibold text-ink dark:text-canvas tracking-tight group-hover:underline">
                        {b.title}
                      </span>
                      {hasScore ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-botanical inline-block" />
                      ) : (
                        <Circle className="w-3 h-3 text-ink-faint inline-block" />
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-ink-muted dark:text-ink-subtle mt-0.5">
                      {b.domainName}
                    </div>
                  </td>

                  {/* Category tag */}
                  <td className="py-4 px-4 hidden md:table-cell font-mono text-[10px] text-ink-muted uppercase">
                    <span className="border border-hairline dark:border-hairline-dark px-2 py-0.5 rounded-none bg-canvas dark:bg-darkbg">
                      {b.badge}
                    </span>
                  </td>

                  {/* Normative median */}
                  <td className="py-4 px-4 text-right font-mono text-ink-muted">
                    {b.normativeMedian} {b.unit}
                  </td>

                  {/* User Personal Best */}
                  <td className="py-4 px-4 text-right font-mono">
                    {hasScore ? (
                      <span className="font-semibold text-ink dark:text-canvas">
                        {stats.bestScore} {b.unit}
                      </span>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>

                  {/* Percentile Rank */}
                  <td className="py-4 px-4 text-right hidden sm:table-cell font-mono">
                    {percentile !== null ? (
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-ink dark:text-canvas">{percentile}%</span>
                        <span className="text-[9px] text-botanical font-medium">
                          {formatGradeLabel(grade!)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-ink-faint">Non évalué</span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td
                    className="py-4 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onInspectDistribution(b)}
                        className="p-1.5 border border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas text-ink-muted hover:text-ink dark:hover:text-canvas transition-colors"
                        title="Courbe de distribution gaussienne"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSelectBenchmark(b.id)}
                        className="px-2.5 py-1 bg-ink text-canvas dark:bg-canvas dark:text-ink font-mono text-[10px] tracking-wider uppercase flex items-center gap-1 hover:opacity-85 transition-opacity"
                      >
                        <span>{hasScore ? 'REJOUER' : 'TESTER'}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Catalog Metric Summary Bar */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border border-hairline dark:border-hairline-dark p-6 bg-canvas-pure dark:bg-darkbg-surface">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-ink-muted uppercase">NORMES APPLIQUÉES</span>
          <div className="font-serif text-lg font-semibold text-ink dark:text-canvas">Standard Gaussien N(μ, σ)</div>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Percentiles calculés selon l'intégrale de probabilité cumulée sur échantillons empiriques.
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-ink-muted uppercase">PRECISION CHRONOMÉTRIQUE</span>
          <div className="font-serif text-lg font-semibold text-ink dark:text-canvas">API High Resolution Time</div>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Mesures au milliseconde près avec lissage des latences de balayage d'affichage matériel.
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-ink-muted uppercase">CONFIDENTIALITÉ LOCALE</span>
          <div className="font-serif text-lg font-semibold text-ink dark:text-canvas">Stockage Client Uniquement</div>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Aucune donnée biométrique ou psychologique n'est transmise à un serveur distant.
          </p>
        </div>
      </div>
    </section>
  );
};
