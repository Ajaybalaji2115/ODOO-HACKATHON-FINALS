import { useEffect, useState, useRef } from "react";
import { getQuestionsByQuiz } from "../../services/quizApi";
import { submitAttempt } from "../../services/attemptApi";
import QuizResult from "./QuizResult";
import toast from 'react-hot-toast';
import { useSelector } from "react-redux";
import { Clock, AlertTriangle, CheckCircle, Shield, Play, ChevronLeft, ChevronRight, List, X, Flag } from "lucide-react";

export default function QuizPlayer({ quizId, topicId }) {
  const { user } = useSelector((state) => state.auth);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // New State for Premium UI
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  // Ref to access latest answers inside event listeners
  const answersRef = useRef(answers);
  const submittedRef = useRef(submitted);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);

  // Timer
  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    load();

    // Security & Anti-Cheating Document Listeners
    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        toast.error("Tab switch detected!", { duration: 4000, icon: '🚨' });
        // Optional: Auto-submit logic here if strict mode
        // handleSubmit(); 
      }
    };

    const preventActions = (e) => {
      e.preventDefault();
      toast.error("Action not allowed!", { id: 'security-warning' });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", preventActions);
    document.addEventListener("copy", preventActions);
    document.addEventListener("cut", preventActions);
    document.addEventListener("paste", preventActions);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", preventActions);
      document.removeEventListener("copy", preventActions);
      document.removeEventListener("cut", preventActions);
      document.removeEventListener("paste", preventActions);
    };
  }, []);

  const load = async () => {
    const data = await getQuestionsByQuiz(quizId);
    setQuestions(data);
  };

  const handleSubmit = async () => {
    if (submittedRef.current) return;

    if (!user?.studentId) {
      console.error("Student ID missing");
      return;
    }

    const currentAnswers = answersRef.current;
    const formatted = Object.entries(currentAnswers).map(([qid, ans]) => ({
      questionId: qid,
      answerText: ans,
    }));

    const body = {
      studentId: user.studentId,
      topicId: topicId,
      timeSpent: elapsedTime,
      answers: formatted,
    };

    try {
      const result = await submitAttempt(quizId, body);
      setSubmitted(result);
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit quiz");
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowReview(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setShowReview(false);
    setShowPalette(false);
  };

  if (submitted) {
    return <QuizResult result={submitted} />;
  }

  if (questions.length === 0) return <div className="p-8 text-center text-slate-500">Loading quiz...</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  // --- REVIEW SCREEN ---
  if (showReview) {
    return (
      <div className="max-w-4xl mx-auto mt-6 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Review Your Attempt</h2>
            <p className="text-slate-500 text-sm">Review your options before final submission.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-blue-600">{formatTime(elapsedTime)}</div>
            <div className="text-xs text-slate-400 uppercase font-bold">Time Elapsed</div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            return (
              <button
                key={q.id}
                onClick={() => jumpToQuestion(idx)}
                className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md
                    ${isAnswered ? 'border-blue-100 bg-blue-50/50' : 'border-amber-100 bg-amber-50/50'}
                 `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${isAnswered ? 'bg-blue-200 text-blue-800' : 'bg-amber-200 text-amber-800'}`}>
                    Q{idx + 1}
                  </span>
                  {isAnswered ? <CheckCircle size={16} className="text-blue-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                </div>
                <p className="text-sm font-medium text-slate-700 line-clamp-2 mb-2">{q.questionText}</p>
                <p className="text-xs text-slate-500 truncate">
                  {isAnswered ? <span className="font-semibold text-blue-700">Selected: {answers[q.id]}</span> : <span className="italic text-amber-600">Not Answered</span>}
                </p>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => setShowReview(false)}
            className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Back to Questions
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-green-600/20 hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            Submit Assessment <CheckCircle size={20} />
          </button>
        </div>
      </div>
    );
  }

  // --- STEPPER UI ---
  return (
    <div className="max-w-4xl mx-auto mt-6 select-none relative pb-20">

      {/* Top Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 flex items-center justify-between sticky top-4 z-40">
        <div className="flex items-center gap-4">
          {/* Palette Toggle */}
          <button
            onClick={() => setShowPalette(!showPalette)}
            className={`p-2 rounded-lg transition-colors ${showPalette ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
            title="Question Palette"
          >
            <List size={24} />
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2"></div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timer</span>
            <span className="text-xl font-mono font-bold text-slate-700 tabular-nums">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="flex flex-col items-end w-48 hidden sm:flex">
            <div className="flex justify-between w-full text-xs font-bold text-slate-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <button
            onClick={() => setShowReview(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Review
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">

        {/* Question Card (Main Focus) */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden min-h-[400px] flex flex-col relative animate-in fade-in duration-300 transform-gpu" key={currentQuestionIndex}> {/* Key forces re-render for auth animation */}

          {/* Header */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/30">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <div className="group relative">
                <Flag size={18} className="text-slate-300 hover:text-amber-500 cursor-pointer transition-colors" />
                <span className="absolute right-0 top-6 w-24 bg-slate-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Report Issue</span>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Options */}
          <div className="p-8 space-y-3 flex-1">
            {currentQuestion.answers.map((op) => {
              const isSelected = answers[currentQuestion.id] === op.optionText;
              return (
                <label
                  key={op.id}
                  className={`
                         group relative flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
                         ${isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-md transform scale-[1.01]'
                      : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                    }
                      `}
                >
                  <input
                    type="radio"
                    name={`q_${currentQuestion.id}`}
                    value={op.optionText}
                    checked={isSelected}
                    onChange={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: op.optionText }))}
                    className="sr-only"
                  />

                  {/* Indicator Circle */}
                  <div className={`
                         w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all
                         ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'}
                      `}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>

                  <span className={`text-lg font-medium ${isSelected ? 'text-blue-900' : 'text-slate-600'} flex-1`}>
                    {op.optionText}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Navigation Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
                    ${currentQuestionIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}
                 `}
            >
              <ChevronLeft size={20} /> Previous
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 transition-all"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Review & Submit' : 'Next Question'}
              {currentQuestionIndex < questions.length - 1 && <ChevronRight size={20} />}
            </button>
          </div>
        </div>

        {/* Question Palette Sidebar (Responsive) */}
        <div className={`
            fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50
            md:relative md:transform-none md:w-64 md:shadow-none md:bg-transparent md:block
            ${showPalette ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
         `}>
          {/* Mobile Close Button */}
          <div className="md:hidden p-4 flex justify-end">
            <button onClick={() => setShowPalette(false)}><X /></button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
              Question Palette
            </div>
            <div className="p-4 grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = currentQuestionIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={`
                             aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all
                             ${isCurrent
                        ? 'bg-blue-600 text-white shadow-md scale-110 ring-2 ring-blue-200'
                        : isAnswered
                          ? 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                          : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 hover:text-slate-600'
                      }
                          `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-600"></span> Current
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></span> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200"></span> Unanswered
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Backdrop for Palette */}
        {showPalette && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setShowPalette(false)}
          ></div>
        )}

      </div>
    </div>
  );
}
