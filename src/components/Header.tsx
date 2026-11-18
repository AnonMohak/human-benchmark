import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Moon, Sun, Award, ArrowLeft } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../utils/audio';
import { BenchmarkStoreData } from '../types/benchmark';
import { calculateGlobalCognitiveIndex } from '../store/benchmarkStore';

interface HeaderProps {
  store: BenchmarkStoreData;
  activeBenchmarkId: string | null;
  onNavigateHome: () => void;
  onOpenCertificate: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  store,
  activeBenchmarkId,
  onNavigateHome,
  onOpenCertificate,
  isDark,
  onToggleTheme
}) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
  };

  const globalIndex = calculateGlobalCognitiveIndex(store);

  return (
    <header className="border-b border-hairline dark:border-hairline-dark bg-canvas dark:bg-darkbg transition-colors duration-200">
      {/* Top micro metadata ticker */}
      <div className="border-b border-hairline dark:border-hairline-dark px-4 sm:px-8 py-1.5 flex justify-between items-center text-[10px] tracking-widest font-mono text-ink-muted dark:text-ink-subtle uppercase">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-botanical animate-pulse"></span>
            SYS.STATUS // NORMAL
          </span>
          <span className="hidden md:inline">PARIS / UTC+01:00</span>
          <span className="hidden sm:inline">LOC: {currentTime || '12:00:00'}</span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="hidden sm:inline">
            ARCHIVE COGNITIVE // V1.0.0
          </span>
          <span>
            ÉPREUVES : {globalIndex.testsCompletedCount} / 8 COMPLÉTÉES
          </span>
        </div>
      </div>

      {/* Main Masthead */}
      <div className="px-4 sm:px-8 py-5 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {activeBenchmarkId && (
            <button
              onClick={onNavigateHome}
              className="p-2 border border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas transition-colors group"
              title="Retour au catalogue (Back to Index)"
            >
              <ArrowLeft className="w-4 h-4 text-ink dark:text-canvas group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          <div
            onClick={onNavigateHome}
            className="cursor-pointer group"
          >
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl sm:text-2xl font-serif tracking-tight text-ink dark:text-canvas font-semibold">
                ÉTABLISSEMENTS
              </h1>
              <span className="text-xs font-mono tracking-widest text-ink-muted dark:text-ink-subtle uppercase">
                / BENCHMARK HUMAIN
              </span>
            </div>
            <p className="text-[11px] font-sans text-ink-muted dark:text-ink-subtle tracking-wide mt-0.5">
              Évaluation rigoureuse des facultés cognitives & sensorimotrices
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {globalIndex.averagePercentile !== null && (
            <div className="hidden lg:flex flex-col text-right pr-3 border-r border-hairline dark:border-hairline-dark">
              <span className="text-[10px] font-mono tracking-widest text-ink-muted uppercase">INDICE GLOBAL</span>
              <span className="text-sm font-serif font-bold text-ink dark:text-canvas">
                {globalIndex.averagePercentile}% <span className="text-xs font-sans font-normal text-ink-muted">({globalIndex.grade})</span>
              </span>
            </div>
          )}

          <button
            onClick={onOpenCertificate}
            className="flex items-center gap-2 px-3 py-1.5 border border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas text-xs font-mono tracking-wider text-ink dark:text-canvas transition-colors bg-canvas-pure dark:bg-darkbg-surface"
          >
            <Award className="w-3.5 h-3.5 text-lacquer" />
            <span className="hidden sm:inline">DOSSIER</span> CERTIFICAT
          </button>

          <button
            onClick={toggleSound}
            aria-label="Toggle sound feedback"
            className="p-2 border border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas text-ink dark:text-canvas transition-colors bg-canvas-pure dark:bg-darkbg-surface"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-ink-subtle" />}
          </button>

          <button
            onClick={onToggleTheme}
            aria-label="Toggle visual contrast theme"
            className="p-2 border border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas text-ink dark:text-canvas transition-colors bg-canvas-pure dark:bg-darkbg-surface"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
