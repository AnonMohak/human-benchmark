import React from 'react';
import { BenchmarkStoreData } from '../types/benchmark';
import { BENCHMARKS_CATALOG } from '../data/benchmarks';
import { calculateGlobalCognitiveIndex } from '../store/benchmarkStore';
import { calculatePercentile, formatGradeLabel, getCognitiveGrade } from '../utils/statistics';
import { X, Printer, Award, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  store: BenchmarkStoreData;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ store, onClose }) => {
  const globalIndex = calculateGlobalCognitiveIndex(store);
  const certDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const certId = `ÉTAB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 dark:bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-canvas dark:bg-darkbg-surface border border-hairline dark:border-hairline-dark max-w-2xl w-full p-6 sm:p-10 space-y-8 shadow-2xl relative my-8">
        {/* Modal Controls (Hidden when printing) */}
        <div className="no-print flex justify-between items-center border-b border-hairline dark:border-hairline-dark pb-4">
          <span className="text-[10px] font-mono tracking-widest text-ink-muted uppercase">
            DOSSIER COGNITIF // IMPRESSION OFFICIELLE
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas text-xs font-mono tracking-wider flex items-center gap-1.5 bg-canvas-pure dark:bg-darkbg text-ink dark:text-canvas"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>IMPRIMER / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 border border-hairline dark:border-hairline-dark hover:border-ink dark:hover:border-canvas text-ink-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Printed) */}
        <div className="border-4 border-double border-ink dark:border-canvas p-6 sm:p-10 bg-canvas-pure dark:bg-darkbg-surface text-ink dark:text-canvas space-y-8 relative">
          {/* Subtle Corner Ornaments */}
          <div className="absolute top-2 left-2 text-xs font-serif opacity-40">✦</div>
          <div className="absolute top-2 right-2 text-xs font-serif opacity-40">✦</div>
          <div className="absolute bottom-2 left-2 text-xs font-serif opacity-40">✦</div>
          <div className="absolute bottom-2 right-2 text-xs font-serif opacity-40">✦</div>

          {/* Crest / Monogram Header */}
          <div className="text-center space-y-2">
            <div className="inline-block p-2 border border-current rounded-full mb-1">
              <Award className="w-6 h-6 text-lacquer" />
            </div>
            <h2 className="text-xs font-mono tracking-widest text-ink-muted uppercase">
              RÉPUBLIQUE DES SCIENCES COGNITIVES &amp; CHRONOMÉTRIQUES
            </h2>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight uppercase">
              Certificat d'Aptitude Psychométrique
            </h1>
            <p className="text-[11px] font-sans text-ink-muted italic max-w-md mx-auto">
              Attestation d'évaluation normée des fonctions sensorimotrices et des capacités de mémoire de travail.
            </p>
          </div>

          {/* Certificate Metadata strip */}
          <div className="border-y border-hairline dark:border-hairline-dark py-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-center">
            <div>
              <span className="text-ink-muted block uppercase">IDENTIFIANT</span>
              <span className="font-bold">{certId}</span>
            </div>
            <div>
              <span className="text-ink-muted block uppercase">DATE D'HOMOLOGATION</span>
              <span className="font-bold">{certDate}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-ink-muted block uppercase">STATUT</span>
              <span className="font-bold text-botanical">CONFORME AUX PROTOCOLES</span>
            </div>
          </div>

          {/* Overall Score Box */}
          <div className="p-4 bg-canvas dark:bg-darkbg border border-hairline dark:border-hairline-dark text-center space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-ink-muted uppercase block">
              INDICE COGNITIF GLOBAL // RANG PERCENTILE
            </span>
            <div className="text-4xl sm:text-5xl font-serif font-bold tracking-tight">
              {globalIndex.averagePercentile !== null ? `${globalIndex.averagePercentile}%` : 'NON COMPLÉTÉ'}
            </div>
            <div className="text-xs font-mono font-semibold text-botanical">
              {globalIndex.averagePercentile !== null
                ? formatGradeLabel(getCognitiveGrade(globalIndex.averagePercentile))
                : 'Effectuez les 8 épreuves pour calibrer votre profil complet'}
            </div>
          </div>

          {/* Table of Breakdown */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-ink-muted uppercase block">
              RELEVÉ DÉTAILLÉ DES ÉPREUVES :
            </span>
            <div className="border border-hairline dark:border-hairline-dark divide-y divide-hairline dark:divide-hairline-dark text-xs font-mono">
              <div className="grid grid-cols-4 py-1.5 px-3 bg-canvas-subtle dark:bg-darkbg text-[9px] text-ink-muted uppercase">
                <span className="col-span-2">DISCIPLINE</span>
                <span className="text-right">RECORD</span>
                <span className="text-right">PERCENTILE</span>
              </div>
              {BENCHMARKS_CATALOG.map((b) => {
                const stats = store[b.id];
                const hasScore = stats && stats.bestScore !== null;
                const p = hasScore
                  ? calculatePercentile(stats.bestScore!, b.normativeMedian, b.normativeStdDev, b.higherIsBetter)
                  : null;

                return (
                  <div key={b.id} className="grid grid-cols-4 py-1 px-3 text-[11px]">
                    <span className="col-span-2 truncate">
                      {b.index}. {b.title}
                    </span>
                    <span className="text-right font-medium">
                      {hasScore ? `${stats.bestScore} ${b.unit}` : '—'}
                    </span>
                    <span className="text-right font-bold text-botanical">
                      {p !== null ? `${p}%` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sceau & Signature line */}
          <div className="pt-6 border-t border-hairline dark:border-hairline-dark flex justify-between items-end text-[10px] font-mono">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-ink-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-botanical" />
                <span>SCEAU DE L'ARCHIVE</span>
              </div>
              <div className="w-24 h-12 border border-hairline dark:border-hairline-dark flex items-center justify-center text-[9px] text-ink-subtle uppercase">
                ÉTABLISSEMENTS
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-ink-muted">VISA DU CONSERVATEUR</div>
              <div className="font-serif italic text-sm text-ink-muted">Romain Chirat</div>
              <div className="w-32 border-b border-current"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
