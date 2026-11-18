# ÉTABLISSEMENTS // Human Benchmark & Cognitive Archive

An editorial psychometric benchmarking platform inspired by the quiet luxury, typography, and Swiss grid aesthetic of [Établissements Studio](https://etablissements.studio/).

---

## Aesthetic & Design Philosophy

- **Haute-Editorial Typography**: Classic high-contrast serif typography (*Playfair Display*) paired with geometric Swiss grotesque (*Inter*) and tracked tabular monospaces (*JetBrains Mono*).
- **Archival Warm Monochrome**: Rich ivory gallery parchment backgrounds (`#FAF9F5`), deep carbon ink (`#141413`), hairline dividers (`#E5E3DA`), and subtle vermilion lacquer accents (`#B42B24`).
- **Precision Metrology**: Sub-millisecond timing via the W3C High Resolution Time API (`performance.now()`), avoiding frame pacing jitter.
- **Normative Statistics**: Real-time Gaussian percentile calculation ($N(\mu, \sigma)$ CDF) modeling empirical cognitive distributions with interactive bell-curve inspection.
- **Client-Side Privacy**: All records and profiles persist in LocalStorage; zero telemetry or telemetry trackers.
- **Printable Certificat de Capacité Cognitive**: Exportable, printable official certificate summarizing the user's complete psychometric profile.

---

## Benchmarks Suite (8 Disciplines)

| No. | Discipline | Domain | Median ($\mu$) | Metric |
| :---: | :--- | :--- | :---: | :---: |
| **01** | **Visual Reaction Latency** | Cognitive Chronometry (Visual Path) | 248 ms | ms |
| **02** | **Auditory Reaction Latency** | Acoustic Brainstem Transmission (880 Hz) | 182 ms | ms |
| **03** | **Visuospatial Sequence Memory** | Visuospatial Working Memory (Simon Paradigm) | 8 levels | Level |
| **04** | **Verbal Recognition Memory** | Lexical Working Memory & Discrimination | 42 words | Words |
| **05** | **Numerical Span Memory** | Immediate Span (Miller's $7 \pm 2$ Law) | 9 digits | Digits |
| **06** | **Chimp Spatial Span** | Iconic Memory & Spatial Planning (Ayumu Paradigm) | 11 tiles | Level |
| **07** | **Precision Ballistic Aiming** | Visuomotor Target Saccades (Fitts's Law) | 420 ms | ms/target |
| **08** | **Stroop Cognitive Interference** | Prefrontal Inhibitory Control (Stroop Effect) | 560 ms | ms |

---

## Technical Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom editorial configuration
- **Audio Synthesis**: Native Web Audio API harmonic oscillator
- **Testing**: Vitest unit testing suite
- **Icons**: Lucide React (hairline stroke width)

---

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run unit tests
npm test

# Build for production
npm run build
```
