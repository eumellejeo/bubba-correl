import React, { useCallback, useState } from 'react';
import questionsData from './data/questions.json';
import {
  AreaSelectionMode,
  ExamQuestionItem,
  OptionKey,
  Question,
} from './types/exam';
import {
  generateExamQuestions,
  isTopicActiveInAreaMode,
  TOPICS_METADATA,
} from './utils/examEngine';
import { Header } from './components/common/Header';
import { ExamLobby } from './components/lobby/ExamLobby';
import { ExamWorkspace } from './components/exam/ExamWorkspace';
import { ExamResults } from './components/results/ExamResults';

const ALL_QUESTIONS = questionsData as Question[];

type AppMode = 'LOBBY' | 'EXAM' | 'RESULTS';

const DEFAULT_QUOTAS: Record<string, number> = {
  history: 10,
  theory: 10,
  practice: 10,
  structures: 10,
  technology: 10,
  utilities: 10,
  methods: 10,
};

export const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('LOBBY');
  const [areaMode, setAreaMode] = useState<AreaSelectionMode>('BOTH');
  const [topicQuotas, setTopicQuotas] = useState<Record<string, number>>(DEFAULT_QUOTAS);

  // Active Exam Session State
  const [examItems, setExamItems] = useState<ExamQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, OptionKey>>({});
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});

  const handleChangeAreaMode = useCallback((newAreaMode: AreaSelectionMode) => {
    setAreaMode(newAreaMode);
  }, []);

  const handleChangeTopicQuota = useCallback((slug: string, count: number) => {
    setTopicQuotas((prev) => ({
      ...prev,
      [slug]: Math.max(0, Math.min(60, count)),
    }));
  }, []);

  const handleSelectAllActive = useCallback(() => {
    setTopicQuotas((prev) => {
      const next = { ...prev };
      for (const t of TOPICS_METADATA) {
        if (isTopicActiveInAreaMode(t, areaMode)) {
          next[t.slug] = t.totalAvailable;
        }
      }
      return next;
    });
  }, [areaMode]);

  const handleResetActive = useCallback(() => {
    setTopicQuotas((prev) => {
      const next = { ...prev };
      for (const t of TOPICS_METADATA) {
        if (isTopicActiveInAreaMode(t, areaMode)) {
          next[t.slug] = 0;
        }
      }
      return next;
    });
  }, [areaMode]);

  const handleStartExam = useCallback(() => {
    const generated = generateExamQuestions(ALL_QUESTIONS, areaMode, topicQuotas);
    if (generated.length === 0) return;

    setExamItems(generated);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedIds({});
    setMode('EXAM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [areaMode, topicQuotas]);

  const handleSelectAnswer = useCallback((questionId: string, originalKey: OptionKey) => {
    setUserAnswers((prev) => {
      // Once an answer is submitted for a question in this session, lock it so it cannot be changed
      if (prev[questionId]) {
        return prev;
      }
      return {
        ...prev,
        [questionId]: originalKey,
      };
    });
  }, []);

  const handleToggleFlag = useCallback((questionId: string) => {
    setFlaggedIds((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }, []);

  const handleJumpToQuestion = useCallback((index: number) => {
    setCurrentIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmitExam = useCallback(() => {
    setMode('RESULTS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleReturnToLobby = useCallback(() => {
    setMode('LOBBY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const answeredCount = examItems.filter((item) => Boolean(userAnswers[item.id])).length;

  return (
    <div className="min-h-screen flex flex-col bg-roseGold-ivory text-espresso-800 font-sans">
      <Header
        mode={mode}
        totalQuestions={examItems.length}
        answeredCount={answeredCount}
        onResetToLobby={handleReturnToLobby}
      />

      <div className="flex-1">
        {mode === 'LOBBY' && (
          <ExamLobby
            areaMode={areaMode}
            topicQuotas={topicQuotas}
            onChangeAreaMode={handleChangeAreaMode}
            onChangeTopicQuota={handleChangeTopicQuota}
            onSelectAllActive={handleSelectAllActive}
            onResetActive={handleResetActive}
            onStartExam={handleStartExam}
          />
        )}

        {mode === 'EXAM' && examItems.length > 0 && (
          <ExamWorkspace
            items={examItems}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            flaggedIds={flaggedIds}
            onSelectAnswer={handleSelectAnswer}
            onToggleFlag={handleToggleFlag}
            onJumpToQuestion={handleJumpToQuestion}
            onSubmitExam={handleSubmitExam}
          />
        )}

        {mode === 'RESULTS' && examItems.length > 0 && (
          <ExamResults
            items={examItems}
            userAnswers={userAnswers}
            flaggedIds={flaggedIds}
            onRetakeSameConfig={handleStartExam}
            onReturnToLobby={handleReturnToLobby}
          />
        )}
      </div>
    </div>
  );
};

export default App;

