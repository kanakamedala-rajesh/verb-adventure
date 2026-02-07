'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { verbsData, getRandomDistractors, normalize, Question, Answer } from '@/lib/verbs';
import { useAudio } from '@/hooks/use-audio';
import { useStats } from '@/hooks/use-stats';
import { useUser } from '@/hooks/use-user';

// Components
import { SoundToggle } from '@/components/game/SoundToggle';
import { StartScreen } from '@/components/game/StartScreen';
import { StudyScreen } from '@/components/game/StudyScreen';
import { QuizScreen } from '@/components/game/QuizScreen';
import { ResultScreen } from '@/components/game/ResultScreen';
import { QuestionPalette } from '@/components/game/QuestionPalette';
import { SettingsModal } from '@/components/game/SettingsModal';
import { NamePrompt } from '@/components/game/NamePrompt';
import { getRank } from '@/lib/verbs';

export default function Home() {
  const [gameState, setGameState] = useState<'start' | 'study' | 'playing' | 'results' | 'review'>('start'); 
  const [mode, setMode] = useState<'immediate' | 'delayed' | 'review'>('immediate'); 
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [allAnswers, setAllAnswers] = useState<Record<number, Answer>>({}); 
  const [allResults, setAllResults] = useState<Record<number, boolean>>({}); 
  const [streak, setStreak] = useState(0); 
  
  const { 
    isMuted, 
    toggleMute, 
    playSound, 
    voices, 
    selectedVoiceURI, 
    speed, 
    changeVoice, 
    changeSpeed,
    speak,
    isSpeaking 
  } = useAudio();

  const { stats, updateStats } = useStats();
  const { name, updateName, isLoading: isUserLoading } = useUser();
  
  const [showSummary, setShowSummary] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const audioProps = { isMuted, toggleMute, playSound, speak, isSpeaking };

  // --- QUIZ LOGIC ---

  const startQuiz = (selectedMode: 'immediate' | 'delayed', count: number, difficulty: 'all' | 'common' | 'advanced' = 'all') => {
    setMode(selectedMode);
    
    let filteredVerbs = [...verbsData];
    if (difficulty !== 'all') {
      filteredVerbs = filteredVerbs.filter(v => v.difficulty === difficulty);
    }

    const shuffledVerbs = [...filteredVerbs];
    for (let i = shuffledVerbs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledVerbs[i], shuffledVerbs[j]] = [shuffledVerbs[j], shuffledVerbs[i]];
    }

    const selectedVerbs = shuffledVerbs.slice(0, count);
    
    const newQuestions: Question[] = selectedVerbs.map(verb => {
      const rand = Math.random();
      let type: 'fill' | 'mcq' | 'tf' = 'fill'; 
      if (rand > 0.4 && rand < 0.75) type = 'mcq'; 
      if (rand >= 0.75) type = 'tf'; 

      const questionData: Question = { id: Math.random().toString(36).substr(2, 9), verb, type };

      if (type === 'mcq') {
        const subType = Math.random() > 0.5 ? 'simple' : 'participle';
        const correctAnswer = verb[subType];
        const distractors = getRandomDistractors(correctAnswer, subType, 3);
        questionData.subType = subType;
        questionData.correctAnswer = correctAnswer;
        questionData.options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      } else if (type === 'tf') {
        const subType = Math.random() > 0.5 ? 'simple' : 'participle';
        const isTrue = Math.random() > 0.5;
        const correctAnswer = verb[subType];
        let targetValue = correctAnswer;
        
        if (!isTrue) {
          const [wrong] = getRandomDistractors(correctAnswer, subType, 1);
          targetValue = wrong;
        }
        
        questionData.subType = subType;
        questionData.isTrue = isTrue;
        questionData.targetValue = targetValue;
      }

      return questionData;
    });
    
    setQuestions(newQuestions);
    setAllAnswers({});
    setAllResults({});
    setStreak(0);
    setCurrentQuestionIndex(0);
    setShowConfetti(false);
    setGameState('playing');
  };

  const handleAnswerChange = (index: number, answerData: Answer) => {
    if (mode === 'review') return;
    setAllAnswers(prev => ({ ...prev, [index]: answerData }));
  };

  const calculateResult = (question: Question, answer: Answer) => {
      if (!answer) return false;
      if (question.type === 'fill') {
        const isSimpleCorrect = normalize(answer.simple || '') === normalize(question.verb.simple);
        const isParticipleCorrect = normalize(answer.participle || '') === normalize(question.verb.participle);
        return isSimpleCorrect && isParticipleCorrect;
      } else if (question.type === 'mcq') {
        return answer.selected === question.correctAnswer;
      } else if (question.type === 'tf') {
        const userSaysTrue = answer.selected === 'True';
        return userSaysTrue === question.isTrue;
      }
      return false;
  };

  const checkSingleAnswer = (index: number) => {
      const isCorrect = calculateResult(questions[index], allAnswers[index]);
      setAllResults(prev => ({ ...prev, [index]: isCorrect }));
      if (isCorrect) {
        playSound('correct');
        setStreak(s => {
          const newStreak = s + 1;
          if (newStreak > 1) playSound('streak');
          return newStreak;
        });
      } else {
        playSound('incorrect');
        setStreak(0);
      }
      return isCorrect;
  };

  const handleNavigate = (newIndex: number) => {
      if (newIndex >= 0 && newIndex < questions.length) {
          setCurrentQuestionIndex(newIndex);
      } else if (newIndex >= questions.length && mode === 'immediate') {
           finishQuiz();
      }
  };

  const finishQuiz = () => {
    let finalScore = 0;
    if (mode === 'delayed') {
        const newResults: Record<number, boolean> = {};
        questions.forEach((_, idx) => {
            const isCorrect = calculateResult(questions[idx], allAnswers[idx]);
            newResults[idx] = isCorrect;
            if (isCorrect) finalScore++;
        });
        setAllResults(newResults);
    } else {
        finalScore = Object.values(allResults).filter(r => r === true).length;
    }

    // Update stats
    const rank = getRank(Math.round((finalScore / questions.length) * 100));
    updateStats(finalScore, questions.length, rank.title);

    setGameState('results');
    
    if (finalScore >= questions.length * 0.6) {
      setShowConfetti(true);
      setTimeout(() => playSound('win'), 500);
    }
  };

  const startReview = () => {
    setMode('review');
    setCurrentQuestionIndex(0);
    setGameState('review');
  };

  if (isUserLoading) return <div className="min-h-screen bg-blue-50" />;

  return (
    <main className="min-h-screen bg-blue-50 font-body text-slate-800 selection:bg-blue-200 relative overflow-x-hidden">
      {!name && <NamePrompt onConfirm={updateName} />}
      
      <SoundToggle onOpenSettings={() => setIsSettingsOpen(true)} />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voices={voices}
        selectedVoiceURI={selectedVoiceURI}
        speed={speed}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onChangeVoice={changeVoice}
        onChangeSpeed={changeSpeed}
        onSoundPop={() => playSound('pop')}
        onSpeak={speak}
      />

      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <StartScreen 
            key="start" 
            onStart={startQuiz} 
            onStudy={() => setGameState('study')} 
            onSoundPop={() => playSound('pop')} 
            stats={stats}
            userName={name || ''}
          />
        )}
        
        {gameState === 'study' && (
          <StudyScreen 
            key="study" 
            onBack={() => setGameState('start')} 
            onSoundPop={() => playSound('pop')} 
            audio={audioProps}
          />
        )}
        
        {(gameState === 'playing' || gameState === 'review') && (
          <div key="quiz-engine">
              <QuizScreen 
                  questions={questions}
                  currentIndex={currentQuestionIndex}
                  allAnswers={allAnswers}
                  allResults={allResults}
                  onAnswerChange={handleAnswerChange}
                  onCheck={checkSingleAnswer}
                  onNavigate={handleNavigate}
                  onFinish={finishQuiz}
                  onExit={() => setGameState('start')}
                  mode={mode}
                  onShowSummary={() => setShowSummary(true)}
                  streak={streak}
                  onSoundPop={() => playSound('pop')}
                  audio={audioProps}
                  userName={name || ''}
              />
              <AnimatePresence>
                {showSummary && (
                    <QuestionPalette 
                        questions={questions}
                        results={allResults}
                        answers={allAnswers}
                        currentIndex={currentQuestionIndex}
                        mode={mode === 'review' ? 'immediate' : mode}
                        onJump={setCurrentQuestionIndex}
                        onClose={() => setShowSummary(false)}
                        onSoundPop={() => playSound('pop')}
                    />
                )}
              </AnimatePresence>
          </div>
        )}
        
        {gameState === 'results' && (
          <ResultScreen 
            key="results"
            score={Object.values(allResults).filter(r => r === true).length} 
            total={questions.length} 
            onRestart={startQuiz} 
            onHome={() => setGameState('start')}
            onReview={startReview}
            showConfetti={showConfetti}
            mode={mode === 'review' ? 'delayed' : mode}
            onSoundPop={() => playSound('pop')}
            userName={name || ''}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
