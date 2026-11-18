import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-hairline dark:border-hairline-dark bg-canvas dark:bg-darkbg text-ink dark:text-canvas transition-colors duration-200 mt-auto">
      <div className="px-4 sm:px-8 py-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs font-sans">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-semibold tracking-tight">ÉTABLISSEMENTS</span>
            <span className="font-mono text-[10px] tracking-widest text-ink-muted">STUDIO COGNITIF</span>
          </div>
          <p className="text-ink-muted dark:text-ink-subtle leading-relaxed max-w-md">
            Plateforme de métrologie cognitive inspirée par la rigueur éditoriale et la typographie suisse de haute précision.
            Mesures calibrées au milliseconde via l'API Web Performance et distributions normatives gaussiennes.
          </p>
        </div>

        <div className="space-y-2 font-mono text-[11px]">
          <span className="text-[10px] tracking-widest text-ink-muted uppercase block">DISCIPLINES</span>
          <ul className="space-y-1 text-ink-muted dark:text-ink-subtle">
            <li>01. Voie Optique & Réflexe</li>
            <li>02. Chronométrie Auditive</li>
            <li>03. Empan Visuo-Spatial</li>
            <li>04. Reconnaissance Lexicale</li>
            <li>05. Mémoire Immédiate (Miller)</li>
            <li>06. Mémoire Primate (Ayumu)</li>
            <li>07. Précision Balistique</li>
            <li>08. Inhibition Préfrontale (Stroop)</li>
          </ul>
        </div>

        <div className="space-y-2 font-mono text-[11px]">
          <span className="text-[10px] tracking-widest text-ink-muted uppercase block">RÉFÉRENCES ÉDITORIALES</span>
          <p className="text-ink-muted dark:text-ink-subtle leading-relaxed">
            Direction artistique : Établissements Studio, Romain Chirat.<br />
            Caractères : Playfair Display &amp; Inter.<br />
            Étalonnage statistique : Normes psychométriques empiriques.
          </p>
          <div className="pt-2 text-[10px] text-ink-subtle">
            © {new Date().getFullYear()} ÉTABLISSEMENTS // TOUS DROITS RÉSERVÉS.
          </div>
        </div>
      </div>
    </footer>
  );
};
