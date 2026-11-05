import {
  AreaSelectionMode,
  ExamQuestionItem,
  OptionKey,
  Question,
  ShuffledOption,
  TopicMetadata,
} from '../types/exam';

export const TOPICS_METADATA: TopicMetadata[] = [
  {
    slug: 'history',
    name: 'History of Architecture',
    area: 'Area A',
    description: 'Prehistoric to contemporary styles, classical orders, Asian & Philippine architectural heritage.',
    totalAvailable: 60,
  },
  {
    slug: 'theory',
    name: 'Theory of Architecture',
    area: 'Area A',
    description: 'Spatial hierarchy, proxemics, Gestalt psychology, anthropometrics, climate & design philosophies.',
    totalAvailable: 60,
  },
  {
    slug: 'practice',
    name: 'Professional Practice',
    area: 'Area A',
    description: 'RA 9266, PD 1096 (NBCP), BP 344, BP 220, PD 957, UAP Docs, ethics & contract administration.',
    totalAvailable: 60,
  },
  {
    slug: 'structures',
    name: 'Architectural Structures',
    area: 'Area B',
    description: 'Statics, strength of materials, structural conceptualization, truss/beam mechanics & seismic design.',
    totalAvailable: 60,
  },
  {
    slug: 'technology',
    name: 'Building Technology',
    area: 'Area B',
    description: 'Materials science, ASTM standards, concrete chemistry, masonry, metals, wood, glass & finishes.',
    totalAvailable: 60,
  },
  {
    slug: 'utilities',
    name: 'Building Utilities',
    area: 'Area B',
    description: 'Plumbing & sanitary (NPCP), electrical (PEC), HVAC, acoustics, lighting & life safety systems.',
    totalAvailable: 60,
  },
  {
    slug: 'methods',
    name: 'Construction Methods',
    area: 'Area B',
    description: 'Siteworks, formwork, foundations, framing systems, PERT/CPM scheduling & project execution.',
    totalAvailable: 60,
  },
];

const DISPLAY_LABELS: OptionKey[] = ['A', 'B', 'C', 'D'];

/**
 * Unbiased Fisher-Yates array shuffle returning a new array
 */
export function shuffleArray<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffles the 4 options of a question and assigns A, B, C, D display labels
 * while keeping originalKey intact for accurate grading.
 */
export function createShuffledQuestionItem(question: Question): ExamQuestionItem {
  const randomizedOptions = shuffleArray(question.options);
  const shuffledOptions: ShuffledOption[] = randomizedOptions.map((opt, idx) => ({
    displayLabel: DISPLAY_LABELS[idx],
    originalKey: opt.key,
    text: opt.text,
  }));

  return {
    ...question,
    shuffledOptions,
  };
}

/**
 * Checks if a topic belongs to the active area selection mode
 */
export function isTopicActiveInAreaMode(topic: TopicMetadata, areaMode: AreaSelectionMode): boolean {
  if (areaMode === 'BOTH') return true;
  if (areaMode === 'AREA_A') return topic.area === 'Area A';
  return topic.area === 'Area B';
}

/**
 * Builds a randomized exam question list according to user-selected quotas
 */
export function generateExamQuestions(
  allQuestions: Question[],
  areaMode: AreaSelectionMode,
  topicQuotas: Record<string, number>
): ExamQuestionItem[] {
  const selectedItems: ExamQuestionItem[] = [];

  for (const topicMeta of TOPICS_METADATA) {
    if (!isTopicActiveInAreaMode(topicMeta, areaMode)) continue;

    const quota = Math.max(0, Math.min(topicMeta.totalAvailable, topicQuotas[topicMeta.slug] || 0));
    if (quota === 0) continue;

    const pool = allQuestions.filter((q) => q.topicSlug === topicMeta.slug);
    const sampled = shuffleArray(pool).slice(0, quota);

    for (const q of sampled) {
      selectedItems.push(createShuffledQuestionItem(q));
    }
  }

  return selectedItems;
}

