import { BenchmarkId, BenchmarkMetadata } from '../types/benchmark';

export const BENCHMARKS_CATALOG: BenchmarkMetadata[] = [
  {
    id: 'visual-reaction',
    index: '01',
    title: 'Visual Reaction Latency',
    catalogName: 'RÉFLEXE VISUEL',
    domainName: 'CHRONOMÉTRIE COGNITIVE / VOIE OPTIQUE',
    summary: 'Measures neural transit latency from retinal photon excitation to motor actuation.',
    instructions: [
      'The display will prime in an expectant state (vermilion).',
      'Wait attentively for the visual stimulus to invert to chromatic green.',
      'Click or actuate the spacebar instantaneously upon detection.',
      'Anticipatory false starts will register as invalidated trials.'
    ],
    category: 'reflex',
    unit: 'ms',
    higherIsBetter: false,
    normativeMedian: 248,
    normativeStdDev: 34,
    badge: 'VOIE OPTIQUE'
  },
  {
    id: 'audio-reaction',
    index: '02',
    title: 'Auditory Reaction Latency',
    catalogName: 'RÉFLEXE AUDITIF',
    domainName: 'CHRONOMÉTRIE COGNITIVE / VOIE ACOUSTIQUE',
    summary: 'Quantifies auditory brainstem transit speed via 880Hz acoustic stimulus impulses.',
    instructions: [
      'Keep your acoustic transducers or speakers engaged at an audible volume.',
      'Click when prompted to arm the auditory trigger.',
      'Actuate immediately upon hearing the acoustic impulse tone.',
      'Auditory pathways typically register 40-60ms swifter than visual processing.'
    ],
    category: 'reflex',
    unit: 'ms',
    higherIsBetter: false,
    normativeMedian: 182,
    normativeStdDev: 28,
    badge: 'VOIE ACOUSTIQUE'
  },
  {
    id: 'sequence-memory',
    index: '03',
    title: 'Visuospatial Sequence Memory',
    catalogName: 'MÉMOIRE SÉQUENTIELLE',
    domainName: 'EMPAN VISUO-SPATIAL / BOUCLE PHONOLOGIQUE',
    summary: 'Assesses working memory span via expanding non-verbal spatial patterns.',
    instructions: [
      'Observe the 3×3 matrix as tiles illuminate in a deterministic sequence.',
      'Replicate the exact coordinate path in sequential chronological order.',
      'Each successful replication lengthens the sequence chain by one incremental step.',
      'A solitary erroneous coordinate terminates the evaluation.'
    ],
    category: 'memory',
    unit: 'level',
    higherIsBetter: true,
    normativeMedian: 8,
    normativeStdDev: 2.5,
    badge: 'MATRICE SPATIALE'
  },
  {
    id: 'verbal-memory',
    index: '04',
    title: 'Verbal Recognition Memory',
    catalogName: 'MÉMOIRE VERBALE',
    domainName: 'RECONNAISSANCE LEXICALE / MÉMOIRE DE TRAVAIL',
    summary: 'Evaluates lexical retention and working memory discrimination across expanding word banks.',
    instructions: [
      'Lexical terms are presented sequentially in singular isolation.',
      'Select "SEEN" if the term was encountered earlier within this test cycle.',
      'Select "NEW" if this marks the initial presentation of the term.',
      'Three diagnostic strikes culminate in the definitive score evaluation.'
    ],
    category: 'memory',
    unit: 'words',
    higherIsBetter: true,
    normativeMedian: 42,
    normativeStdDev: 15,
    badge: 'LEXIQUE CONTINU'
  },
  {
    id: 'number-memory',
    index: '05',
    title: 'Numerical Span Memory',
    catalogName: 'EMPAN NUMÉRIQUE',
    domainName: 'MÉMOIRE DE RETENTION IMMÉDIATE',
    summary: 'Measures Miller’s magical span via rapid serial visual digit presentation.',
    instructions: [
      'A numerical string of length N will illuminate for a calibrated duration.',
      'Commit the numerical sequence to immediate working retention.',
      'Key in the exact digits upon emergence of the input prompt.',
      'The sequence expands by one decimal place with every validated round.'
    ],
    category: 'memory',
    unit: 'digits',
    higherIsBetter: true,
    normativeMedian: 9,
    normativeStdDev: 2.1,
    badge: 'SÉRIE DÉCIMALE'
  },
  {
    id: 'chimp-test',
    index: '06',
    title: 'Working Memory Spatial Span (Ayumu Test)',
    catalogName: 'TEST DES PRIMATES',
    domainName: 'MÉMOIRE PHOTOGRAPHIQUE & PLANIFICATION SPATIALE',
    summary: 'Inspired by Kyoto University primate cognition trials testing instantaneous iconic memory.',
    instructions: [
      'Numbered geometric tiles emerge across an architectural matrix.',
      'Engaging tile 1 instantaneously conceals all subsequent numbers into blank faces.',
      'Tap all remaining squares strictly in ascending numerical sequence.',
      'Advancing levels augment the density of the spatial array.'
    ],
    category: 'spatial',
    unit: 'level',
    higherIsBetter: true,
    normativeMedian: 11,
    normativeStdDev: 3.4,
    badge: 'PARADIGME AYUMU'
  },
  {
    id: 'aim-trainer',
    index: '07',
    title: 'Precision Ballistic Aiming',
    catalogName: 'PRÉCISION BALISTIQUE',
    domainName: 'COORDINATION SENSORI-MOTRICE / CIBLES DISCRÈTES',
    summary: 'Calculates kinematic mouse translation latency and targeting accuracy under rapid saccades.',
    instructions: [
      'Acquire and click 30 consecutive randomized target coordinates.',
      'Targets materialize across the testing field as previous ones are neutralized.',
      'Both average target acquisition duration and spatial precision are recorded.',
      'Rapid ballistic motor movements without hesitation yield optimal marks.'
    ],
    category: 'spatial',
    unit: 'ms',
    higherIsBetter: false,
    normativeMedian: 420,
    normativeStdDev: 65,
    badge: 'COORDINATION OCULOMOTRICE'
  },
  {
    id: 'stroop-test',
    index: '08',
    title: 'Cognitive Interference & Inhibition',
    catalogName: 'INTERFÉRENCE DE STROOP',
    domainName: 'CONTRÔLE INHIBITEUR / CORTEX PRÉFRONTAL',
    summary: 'Measures executive inhibitory capacity when semantic text contradicts chromatic visual ink.',
    instructions: [
      'A color word appears (e.g. "BLUE", "RED", "GREEN", "YELLOW").',
      'Select the physical INK COLOR of the letters, ignoring the semantic reading.',
      'Incongruent trials demand prefrontal suppression of automatic reading reflexes.',
      '20 trials evaluate processing latency and error rate under cognitive interference.'
    ],
    category: 'executive',
    unit: 'ms',
    higherIsBetter: false,
    normativeMedian: 560,
    normativeStdDev: 75,
    badge: 'FONCTION EXÉCUTIVE'
  }
];

export const BENCHMARK_MAP = new Map<BenchmarkId, BenchmarkMetadata>(
  BENCHMARKS_CATALOG.map((b) => [b.id, b])
);
