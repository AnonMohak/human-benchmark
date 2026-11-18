import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BenchmarkId, BenchmarkMetadata, BenchmarkStoreData, BenchmarkResult } from './types/benchmark';
import { BENCHMARK_MAP } from './data/benchmarks';
import { loadStore, recordBenchmarkResult } from './store/benchmarkStore';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CatalogTable } from './components/CatalogTable';
import { BellCurveModal } from './components/BellCurveModal';
import { CertificateModal } from './components/CertificateModal';

// Benchmarks
import { VisualReaction } from './components/benchmarks/VisualReaction';
import { AudioReaction } from './components/benchmarks/AudioReaction';
import { SequenceMemory } from './components/benchmarks/SequenceMemory';
import { VerbalMemory } from './components/benchmarks/VerbalMemory';
import { NumberMemory } from './components/benchmarks/NumberMemory';
import { ChimpTest } from './components/benchmarks/ChimpTest';
import { AimTrainer } from './components/benchmarks/AimTrainer';
import { StroopTest } from './components/benchmarks/StroopTest';

export const App: React.FC = () => {
  const [store, setStore] = useState<BenchmarkStoreData>(loadStore);
  const [activeBenchmarkId, setActiveBenchmarkId] = useState<BenchmarkId | null>(null);
  const [inspectingBenchmark, setInspectingBenchmark] = useState<BenchmarkMetadata | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('etablissements_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('etablissements_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('etablissements_theme', 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleRecordResult = (
    score: number,
    trials: { trialIndex: number; value: number; valid: boolean }[] = []
  ): BenchmarkResult => {
    if (!activeBenchmarkId) throw new Error('No active benchmark');
    const { updatedStore, newResult } = recordBenchmarkResult(store, activeBenchmarkId, score, trials);
    setStore(updatedStore);

    if (newResult.percentile >= 90) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#B42B24', '#141413', '#275B41']
        });
      } catch {
        // Ignore confetti errors
      }
    }

    return newResult;
  };

  const activeMeta = activeBenchmarkId ? BENCHMARK_MAP.get(activeBenchmarkId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-canvas dark:bg-darkbg text-ink dark:text-canvas transition-colors duration-200">
      <Header
        store={store}
        activeBenchmarkId={activeBenchmarkId}
        onNavigateHome={() => setActiveBenchmarkId(null)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1">
        {activeBenchmarkId && activeMeta ? (
          <div>
            {activeBenchmarkId === 'visual-reaction' && (
              <VisualReaction
                meta={activeMeta}
                onRecordResult={handleRecordResult}
                onBack={() => setActiveBenchmarkId(null)}
              />
            )}
            {activeBenchmarkId === 'audio-reaction' && (
              <AudioReaction
                meta={activeMeta}
                onRecordResult={handleRecordResult}
                onBack={() => setActiveBenchmarkId(null)}
              />
            )}
            {activeBenchmarkId === 'sequence-memory' && (
              <SequenceMemory
                meta={activeMeta}
                onRecordResult={(score) => handleRecordResult(score, [])}
                onBack={() => setActiveBenchmarkId(null)}
              />
            )}
            {activeBenchmarkId === 'verbal-memory' && (
              <VerbalMemory
                meta={activeMeta}
                onRecordResult={(score) => handleRecordResult(score, [])}
                onBack={() => setActiveBenchmarkId(null)}
              />
            )}
            {activeBenchmarkId === 'number-memory' && (
              <NumberMemory
                meta={activeMeta}
                onRecordResult={(score) => handleRecordResult(score, [])}
                onBack={() => setActiveBenchmarkId(null)}
              />
            )}
            {activeBenchmarkId === 'chimp-test' && (
              <ChimpTest
                meta={activeMeta}
                onRecordResult={(score) => handleRecordResult(score, [])}
                onBack={() => setActiveBenchmarkId(null)}
              />
            )}
            {activeBenchmarkId === 'aim-trainer' && (
              <AimTrainer
                meta={activeMeta}
                onRecordResult={handleRecordResult}
                onBack={() => setActiveBenchmarkId(null)}
              />
            )}
            {activeBenchmarkId === 'stroop-test' && (
              <StroopTest
                meta={activeMeta}
                onRecordResult={handleRecordResult}
                onBack={() => setActiveBenchmarkId(null)}
              />
            )}
          </div>
        ) : (
          <div>
            {/* Hero Section inspired by etablissements.studio */}
            <section className="border-b border-hairline dark:border-hairline-dark px-4 sm:px-8 py-16 sm:py-24 max-w-7xl mx-auto">
              <div className="space-y-6 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas-pure dark:bg-darkbg-surface border border-hairline dark:border-hairline-dark font-mono text-[10px] tracking-widest uppercase text-ink-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-lacquer"></span>
                  <span>ARCHIVE PSYCHOMÉTRIQUE &bull; ÉDITION 2026</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-ink dark:text-canvas leading-[1.1]">
                  Mesure de la capacité cognitive &amp; des réflexes humains.
                </h1>

                <p className="text-base sm:text-lg font-sans text-ink-muted dark:text-ink-subtle leading-relaxed font-light">
                  Une suite rigoureuse de huit épreuves normées évaluant la vitesse de conduction nerveuse, l'empan de mémoire de travail et le contrôle inhibiteur préfrontal.
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
                  <div className="border-l-2 border-ink dark:border-canvas pl-3 py-1">
                    <span className="text-[10px] text-ink-muted uppercase block">CHRONOMÉTRIE</span>
                    <span className="font-semibold text-ink dark:text-canvas">Précision &lt; 1 ms</span>
                  </div>
                  <div className="border-l-2 border-ink dark:border-canvas pl-3 py-1">
                    <span className="text-[10px] text-ink-muted uppercase block">ÉPREUVES STANDARD</span>
                    <span className="font-semibold text-ink dark:text-canvas">08 Protocoles</span>
                  </div>
                  <div className="border-l-2 border-ink dark:border-canvas pl-3 py-1">
                    <span className="text-[10px] text-ink-muted uppercase block">NORMES STATISTIQUES</span>
                    <span className="font-semibold text-ink dark:text-canvas">Gauss N(μ, σ)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Catalog Table */}
            <CatalogTable
              store={store}
              onSelectBenchmark={(id) => setActiveBenchmarkId(id)}
              onInspectDistribution={(meta) => setInspectingBenchmark(meta)}
            />
          </div>
        )}
      </main>

      <Footer />

      {/* Bell Curve Modal */}
      {inspectingBenchmark && (
        <BellCurveModal
          benchmark={inspectingBenchmark}
          store={store}
          onClose={() => setInspectingBenchmark(null)}
        />
      )}

      {/* Official Certificate Modal */}
      {isCertificateOpen && (
        <CertificateModal
          store={store}
          onClose={() => setIsCertificateOpen(false)}
        />
      )}
    </div>
  );
};
export default App;
