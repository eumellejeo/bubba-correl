export type AreaType = 'Area A' | 'Area B';

export type AreaSelectionMode = 'AREA_A' | 'AREA_B' | 'BOTH';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface QuestionOption {
  key: OptionKey;
  text: string;
}

export interface Question {
  id: string;
  area: AreaType;
  topic: string;
  topicSlug: string;
  questionNumber: number;
  question: string;
  visualReference: string | null;
  imageSrc: string;
  options: QuestionOption[];
  correctAnswer: OptionKey;
  rationale: string;
}

export interface ShuffledOption {
  displayLabel: OptionKey; // 'A' | 'B' | 'C' | 'D' as shown in the UI
  originalKey: OptionKey;  // 'A' | 'B' | 'C' | 'D' from the original markdown
  text: string;
}

export interface ExamQuestionItem extends Question {
  shuffledOptions: ShuffledOption[];
}

export interface TopicMetadata {
  slug: string;
  name: string;
  area: AreaType;
  description: string;
  totalAvailable: number;
}

export interface ExamConfig {
  areaMode: AreaSelectionMode;
  topicQuotas: Record<string, number>;
  shuffleQuestionsWithinTopic: boolean;
}

export interface ExamSession {
  items: ExamQuestionItem[];
  currentIndex: number;
  userAnswers: Record<string, OptionKey>; // questionId -> originalKey selected by user
  flaggedIds: Record<string, boolean>;    // questionId -> boolean
  startedAt: number;
  completedAt: number | null;
}

