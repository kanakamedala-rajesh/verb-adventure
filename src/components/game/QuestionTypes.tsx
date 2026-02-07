'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star, Sparkles } from 'lucide-react';
import { Question, Answer } from '@/lib/verbs';

interface QuestionProps {
  question: Question;
  answer: Answer;
  onChange: (answer: Answer) => void;
  isReadOnly: boolean;
  feedback: 'correct' | 'incorrect' | null;
}

const inputBase = "w-full text-2xl sm:text-4xl p-4 sm:p-6 rounded-3xl border-4 outline-none transition-all font-heading text-center placeholder:text-slate-200 bg-white shadow-inner";

export const FillInBlankQuestion = ({ question, answer, onChange, isReadOnly, feedback }: QuestionProps) => {
  const simpleInputRef = useRef<HTMLInputElement>(null);
  const simpleId = `simple-${question.id}`;
  const participleId = `participle-${question.id}`;

  useEffect(() => {
    if (simpleInputRef.current && !isReadOnly) {
      simpleInputRef.current.focus();
    }
  }, [question.id, isReadOnly]);

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-6 sm:space-y-10 w-full max-w-sm mx-auto py-4"
    >
      <div className="space-y-3 sm:space-y-4">
        <label htmlFor={simpleId} className="block font-heading text-blue-400 text-sm sm:text-lg uppercase tracking-widest text-center">Past Simple</label>
        <div className="relative group">
          <input 
            id={simpleId}
            ref={simpleInputRef}
            type="text" 
            value={answer?.simple || ''}
            onChange={(e) => onChange({...answer, simple: e.target.value})}
            disabled={isReadOnly}
            autoComplete="off"
            placeholder="???"
            className={`${inputBase} ${
              feedback === 'correct' ? 'border-green-400 text-green-600 bg-green-50 shadow-none' : 
              feedback === 'incorrect' ? 'border-red-400 text-red-600 bg-red-50 shadow-none' : 
              'border-blue-100 focus:border-blue-400 text-slate-700'
            }`}
          />
          <AnimatePresence>
            {feedback === 'incorrect' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-green-600 font-bold text-center bg-green-50 p-2 rounded-2xl border-2 border-green-100"
              >
                The word is: <span className="underline font-heading">{question.verb.simple}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <label htmlFor={participleId} className="block font-heading text-blue-400 text-sm sm:text-lg uppercase tracking-widest text-center">Past Participle</label>
        <div className="relative group">
          <input 
            id={participleId}
            type="text" 
            value={answer?.participle || ''}
            onChange={(e) => onChange({...answer, participle: e.target.value})}
            disabled={isReadOnly}
            autoComplete="off"
            placeholder="???"
            className={`${inputBase} ${
              feedback === 'correct' ? 'border-green-400 text-green-600 bg-green-50 shadow-none' : 
              feedback === 'incorrect' ? 'border-red-400 text-red-600 bg-red-50 shadow-none' : 
              'border-blue-100 focus:border-blue-400 text-slate-700'
            }`}
          />
          <AnimatePresence>
            {feedback === 'incorrect' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-green-600 font-bold text-center bg-green-50 p-2 rounded-2xl border-2 border-green-100"
              >
                The word is: <span className="underline font-heading">{question.verb.participle}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

interface MCQProps extends QuestionProps {
  onInteract: () => void;
}

export const MultipleChoiceQuestion = ({ question, answer, onChange, isReadOnly, feedback, onInteract }: MCQProps) => {
  const isSimple = question.subType === 'simple';
  const label = isSimple ? "Past Simple" : "Past Participle";

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-6 sm:space-y-8 w-full max-w-sm mx-auto"
    >
      <p className="text-blue-400 font-heading text-center text-sm sm:text-lg uppercase tracking-widest">
        Which one is the <span className="text-blue-600">{label}</span>?
      </p>

      <div className="grid grid-cols-1 gap-3 sm:gap-4" role="radiogroup" aria-label={`Choose the ${label}`}>
        {question.options?.map((option: string, idx: number) => {
          const isSelected = answer?.selected === option;
          const isCorrect = option === question.correctAnswer;
          
          let styleClass = "bg-white border-4 border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50 shadow-sm";
          
          if (isReadOnly) {
            if (feedback) { 
                if (isCorrect) styleClass = "bg-green-50 border-green-400 text-green-600 shadow-none scale-105 z-10";
                else if (isSelected && !isCorrect) styleClass = "bg-red-50 border-red-400 text-red-600 opacity-50 shadow-none";
                else styleClass = "bg-slate-50 border-slate-100 text-slate-200 opacity-30 shadow-none";
            }
          } else if (isSelected) {
            styleClass = "bg-blue-500 border-blue-600 text-white shadow-[0_6px_0_#2563eb] -translate-y-1";
          }

          return (
            <motion.button
              whileHover={!isReadOnly ? { scale: 1.02 } : {}}
              whileTap={!isReadOnly ? { scale: 0.98 } : {}}
              key={idx}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => { if(!isReadOnly) { onInteract(); onChange({ selected: option }); } }}
              className={`p-4 sm:p-6 rounded-[2rem] font-heading text-lg sm:text-2xl transition-all text-center uppercase ${styleClass}`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export const TrueFalseQuestion = ({ question, answer, onChange, isReadOnly, feedback, onInteract }: MCQProps) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-8 sm:space-y-12 w-full max-w-sm mx-auto"
    >
       <div className="text-center bg-orange-50 p-6 sm:p-8 rounded-[3rem] border-4 border-orange-100">
        <p className="text-orange-400 font-heading text-sm uppercase tracking-widest mb-4">Fact Check!</p>
        <p className="text-slate-600 font-bold text-lg sm:text-xl leading-relaxed mb-4">
          Is the <span className="text-orange-500 underline">{question.subType === 'simple' ? 'Past Simple' : 'Past Participle'}</span> of <br/>
          <span className="text-3xl text-slate-800 uppercase mt-2 block font-heading tracking-widest">&quot;{question.verb.base}&quot;</span>
        </p>
        <div className="h-2 w-12 bg-orange-200 rounded-full mx-auto my-4" aria-hidden="true" />
        <p className="text-4xl sm:text-5xl font-heading text-orange-600 uppercase tracking-tight italic">&quot;{question.targetValue}&quot;?</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6" role="radiogroup" aria-label="True or False">
        {['True', 'False'].map((opt) => {
          const isSelected = answer?.selected === opt;
          const isTrueButton = opt === 'True';
          
          let styleClass = "bg-white border-4 border-slate-100 text-slate-400 hover:border-orange-200 hover:text-orange-500 shadow-sm";
          
          if (isReadOnly && feedback) {
             const thisButtonIsCorrectAnswer = (isTrueButton && question.isTrue) || (!isTrueButton && !question.isTrue);
             
             if (thisButtonIsCorrectAnswer) {
                styleClass = "bg-green-500 border-green-600 text-white shadow-none scale-105 z-10";
             } else if (isSelected && !thisButtonIsCorrectAnswer) {
                styleClass = "bg-red-500 border-red-600 text-white opacity-50 shadow-none";
             } else {
                styleClass = "bg-slate-50 border-slate-100 text-slate-200 opacity-30 shadow-none";
             }
          } else if (isSelected) {
            const color = isTrueButton ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600';
            const shadow = isTrueButton ? 'shadow-[0_6px_0_#16a34a]' : 'shadow-[0_6px_0_#dc2626]';
            styleClass = `${color} ${shadow} text-white -translate-y-1`;
          }

          return (
            <motion.button
              whileHover={!isReadOnly ? { scale: 1.05 } : {}}
              whileTap={!isReadOnly ? { scale: 0.95 } : {}}
              key={opt}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => { if(!isReadOnly) { onInteract(); onChange({ selected: opt }); } }}
              className={`py-6 rounded-[2.5rem] font-heading text-xl sm:text-3xl uppercase transition-all flex flex-col items-center justify-center gap-2 ${styleClass}`}
            >
              <span className="text-3xl" aria-hidden="true">{isTrueButton ? '✅' : '❌'}</span>
              {opt}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};