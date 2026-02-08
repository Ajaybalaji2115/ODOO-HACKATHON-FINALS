import React, { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { quizService } from "../../services/quizService"
import { submitAttempt } from "../../services/attemptApi"
import Loader from "../common/Loader"
import toast from "react-hot-toast"
import QuizResult from "./QuizResult"
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, List, X, ChevronLeft, ChevronRight, Flag, Shield } from "lucide-react"

export default function QuizPlayPage() {
  const { quizId, id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)

  const resolvedQuizId = quizId || id || state?.quizId
  const readOnly = state?.readOnly || user?.role === "INSTRUCTOR"

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [quizMeta, setQuizMeta] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submittedResult, setSubmittedResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Timer
  const [startTime] = useState(Date.now())
  const [timeLeft, setTimeLeft] = useState(null)
  const [timerReady, setTimerReady] = useState(false)

  // Premium UI State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [securityAcknowledged, setSecurityAcknowledged] = useState(false)

  useEffect(() => {
    loadQuiz()
    // eslint-disable-next-line
  }, [resolvedQuizId])

  // Refs for Event Listeners
  const submittedRef = React.useRef(submittedResult)
  const submittingRef = React.useRef(submitting)
  const answersRef = React.useRef(answers)

  useEffect(() => {
    submittedRef.current = submittedResult
  }, [submittedResult])

  useEffect(() => {
    submittingRef.current = submitting
  }, [submitting])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  // ---------------- SECURITY ----------------
  useEffect(() => {
    if (readOnly) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current && !submittingRef.current) {
        toast.error("Tab switch detected! Quiz Auto-Submitted.", {
          icon: '🚨',
          duration: 5000
        });
        handleSubmit(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        if (!submittedRef.current && !submittingRef.current) {
          toast.dismiss();
          toast.error("Screenshot attempt detected! Quiz Auto-Submitted.", { icon: '📸', duration: 5000 });
          handleSubmit(true);
        }
      }
    };

    const preventActions = (e) => {
      e.preventDefault();
      toast.error("Action not allowed during quiz!", { id: 'security-warning' });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("contextmenu", preventActions);
    document.addEventListener("copy", preventActions);
    document.addEventListener("cut", preventActions);
    document.addEventListener("paste", preventActions);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("contextmenu", preventActions);
      document.removeEventListener("copy", preventActions);
      document.removeEventListener("cut", preventActions);
      document.removeEventListener("paste", preventActions);
    };
  }, [readOnly]);

  const loadQuiz = async () => {
    try {
      setLoading(true)
      if (!resolvedQuizId) {
        toast.error("Invalid quiz")
        navigate(-1)
        return
      }

      const quiz = await quizService.getQuizById(resolvedQuizId)
      const qlist = await quizService.getQuestionsByQuiz(resolvedQuizId)

      setQuizMeta(quiz)
      setQuestions(qlist || [])

      const duration = quiz?.duration || 10
      setTimeLeft(duration * 60)
      setTimerReady(true)
    } catch (err) {
      toast.error("Failed to load quiz")
    } finally {
      setLoading(false)
    }
  }

  // ---------------- TIMER ----------------
  useEffect(() => {
    if (!timerReady || readOnly || submittedResult) return

    if (timeLeft === 30) {
      toast("⏰ Only 30 seconds left! Your answers will be auto-submitted.", {
        icon: "⚠️",
        duration: 5000,
      })
    }

    if (timeLeft <= 0) {
      handleSubmit(true)
      return
    }

    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft, timerReady, readOnly, submittedResult])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ---------------- ANSWER ----------------
  const handleSelect = (qid, option) => {
    setAnswers((p) => ({ ...p, [qid]: option }))
  }

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (auto = false) => {
    if (readOnly || submitting) return
    setSubmitting(true)

    try {
      const currentAnswers = answersRef.current;
      const payload = {
        studentId: user.studentId,
        topicId: state?.topicId || quizMeta?.topic?.id,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        answers: Object.entries(currentAnswers).map(([qid, ans]) => ({
          questionId: Number(qid),
          answerText: ans,
        })),
      }

      const res = await submitAttempt(resolvedQuizId, payload)
      setSubmittedResult(res)

      if (!auto) toast.success("Quiz submitted")
    } catch {
      toast.error("Submit failed")
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------- RETRY / BACK ----------------
  const handleRetry = () => {
    setSubmittedResult(null)
    setAnswers({})
    setCurrentQuestionIndex(0)
    setSubmitting(false)
    setShowReview(false)

    const duration = quizMeta?.duration || 10
    setTimeLeft(duration * 60)
    setTimerReady(true)
  }

  const handleBackToCourse = () => {
    const courseId = state?.courseId || quizMeta?.courseId || quizMeta?.topic?.courseId
    if (courseId) {
      navigate(`/courses/${courseId}`, { state: { forceReload: Date.now() } })
    } else {
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/dashboard');
      }
    }
  }

  // ---------------- NAVIGATION ----------------
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

  if (loading) return <Loader />
  if (submittedResult) {
    return (
      <QuizResult
        result={submittedResult}
        onRetry={handleRetry}
        onBack={handleBackToCourse}
      />
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).length
  const progressPercent = (answeredCount / questions.length) * 100

  // --- SECURITY ACKNOWLEDGMENT SCREEN ---
  if (!readOnly && quizMeta && !securityAcknowledged) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </button>

          {/* Security Warning Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_25%,rgba(255,255,255,.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.1)_75%,rgba(255,255,255,.1))] bg-[length:20px_20px] opacity-20"></div>
              <div className="relative">
                <div className="inline-block mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-2xl">
                      <Shield className="w-16 h-16 text-red-600" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Security Protocol</h1>
                <p className="text-red-100 text-lg">Please Read Carefully Before Starting</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <p className="text-red-900 font-bold text-lg mb-2">⚠️ Anti-Cheat System Active</p>
                <p className="text-red-800">
                  This assessment is monitored by an advanced anti-cheat system. Any violation of the rules below will result in <strong>immediate automatic submission</strong> of your quiz with current answers.
                </p>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Flag className="text-red-600" size={24} />
                Prohibited Actions
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Tab Switching / Window Minimizing</h3>
                    <p className="text-sm text-slate-600">Leaving this page or minimizing the browser will trigger auto-submission.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Screenshots or Screen Recording</h3>
                    <p className="text-sm text-slate-600">Attempting to capture the screen content is detected and will auto-submit.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Copy / Paste Operations</h3>
                    <p className="text-sm text-slate-600">Clipboard operations are completely disabled during the quiz.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Right-Click Context Menu</h3>
                    <p className="text-sm text-slate-600">The context menu is restricted to prevent unauthorized actions.</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  Before You Start
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Ensure you have a stable internet connection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Close all unnecessary tabs and applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Make sure you won't be interrupted during the quiz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Keep this window in full screen or maximized</span>
                  </li>
                </ul>
              </div>

              {/* Acknowledgment Button */}
              <button
                onClick={() => setSecurityAcknowledged(true)}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold text-lg rounded-xl shadow-2xl shadow-green-600/30 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                <CheckCircle size={24} />
                I Understand & Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- REVIEW SCREEN ---
  if (showReview && !readOnly) {
    return (
      <div className="min-h-screen bg-gray-100 select-none py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Review Your Attempt</h2>
                <p className="text-slate-500 text-sm">Review your options before final submission.</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold text-blue-600">{formatTime(timeLeft)}</div>
                <div className="text-xs text-slate-400 uppercase font-bold">Time Remaining</div>
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
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-green-600/20 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Assessment"} <CheckCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- STEPPER UI ---
  return (
    <div className="min-h-screen bg-gray-100 select-none py-8" onContextMenu={(e) => e.preventDefault()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Button for Instructors */}
        {user?.role === 'INSTRUCTOR' && (
          <button
            onClick={handleBackToCourse}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Course</span>
          </button>
        )}


        {/* Enhanced Sticky Top Bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/50 p-3 mb-4 flex items-center justify-between sticky top-4 z-40 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-4">
            {/* Palette Toggle */}
            {!readOnly && (
              <button
                onClick={() => setShowPalette(!showPalette)}
                className={`p-2 rounded-lg transition-colors ${showPalette ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Question Palette"
              >
                <List size={24} />
              </button>
            )}

            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Timer</span>
              <span className={`text-lg font-mono font-bold tabular-nums transition-colors duration-300 ${!readOnly && timeLeft !== null && timeLeft <= 60
                ? 'text-red-600 animate-pulse'
                : timeLeft <= 180
                  ? 'text-orange-600'
                  : 'text-slate-700'
                }`}>
                {!readOnly && timeLeft !== null ? formatTime(timeLeft) : '00:00'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            {!readOnly && (
              <>
                <div className="flex flex-col items-end w-40 hidden sm:flex">
                  <div className="flex justify-between w-full text-[10px] font-bold text-slate-600 mb-1">
                    <span>Progress</span>
                    <span className="text-blue-600">{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full shadow-lg" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                <button
                  onClick={() => setShowReview(true)}
                  className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-slate-200"
                >
                  📋 Review
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4 items-start">

          {/* Question Palette Sidebar - LEFT SIDE */}
          {!readOnly && (
            <>
              <div className={`
                  fixed inset-y-0 left-0 w-64 bg-white shadow-2xl transform transition-transform duration-300 z-50
                  md:relative md:transform-none md:w-56 md:shadow-none md:bg-transparent md:block
                  ${showPalette ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
               `}>
                {/* Mobile Close Button */}
                <div className="md:hidden p-4 flex justify-end">
                  <button onClick={() => setShowPalette(false)}><X /></button>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden sticky top-24">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
                    <p className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                      <List size={14} /> Palette
                    </p>
                  </div>
                  <div className="p-3 grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {questions.map((q, idx) => {
                      const isAnswered = !!answers[q.id];
                      const isCurrent = currentQuestionIndex === idx;
                      return (
                        <button
                          key={q.id}
                          onClick={() => jumpToQuestion(idx)}
                          className={`
                                   aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300
                                   ${isCurrent
                              ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105 ring-2 ring-blue-200'
                              : isAnswered
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:shadow-sm hover:scale-105'
                                : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700 hover:shadow-sm hover:scale-105'
                            }
                                `}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-3 bg-gradient-to-r from-slate-50 to-blue-50/30 border-t border-slate-200 text-[10px] text-slate-600 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-gradient-to-br from-blue-600 to-blue-500 shadow-sm"></span>
                      <span className="font-medium">Current</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></span>
                      <span className="font-medium">Answered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200"></span>
                      <span className="font-medium">Unanswered</span>
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
            </>
          )}

          {/* Enhanced Question Card */}
          <div className="flex-1 bg-white rounded-xl shadow-xl border border-slate-200/50 overflow-hidden min-h-[400px] flex flex-col relative animate-in fade-in duration-500 transform-gpu hover:shadow-2xl transition-shadow" key={currentQuestionIndex}>

            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wide shadow-md shadow-blue-500/20">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                {quizMeta?.topic?.name && (
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    {quizMeta.topic.name}
                  </span>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Options */}
            <div className="p-6 space-y-2.5 flex-1">
              {currentQuestion.answers.map((op) => {
                const isSelected = answers[currentQuestion.id] === op.optionText;
                return (
                  <label
                    key={op.id}
                    className={`
                         group relative flex items-center p-3.5 rounded-lg border-2 cursor-pointer transition-all duration-300
                         ${isSelected
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-50/30 shadow-lg shadow-blue-500/10 transform scale-[1.01] ring-1 ring-blue-200'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/20 hover:shadow-md'
                      }
                      ${readOnly ? 'cursor-default' : ''}
                      `}
                  >
                    <input
                      type="radio"
                      name={`q_${currentQuestion.id}`}
                      value={op.optionText}
                      checked={isSelected}
                      onChange={() => !readOnly && handleSelect(currentQuestion.id, op.optionText)}
                      className="sr-only"
                      disabled={readOnly}
                    />

                    {/* Enhanced Indicator Circle */}
                    <div className={`
                         w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-300
                         ${isSelected ? 'border-blue-600 bg-gradient-to-br from-blue-600 to-blue-500 shadow-md shadow-blue-500/30' : 'border-slate-300 group-hover:border-blue-400 group-hover:shadow-sm'}
                      `}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200" />}
                    </div>

                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-slate-600'} flex-1`}>
                      {op.optionText}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Instructor Correct Answer */}
            {readOnly && (
              currentQuestion.correctAnswer ? (
                <div className="px-8 pb-4">
                  <p className="text-green-700 font-medium flex items-center gap-2">
                    <CheckCircle size={18} /> Correct Answer: {currentQuestion.correctAnswer}
                  </p>
                </div>
              ) : (
                <div className="px-8 pb-4">
                  <p className="text-yellow-600 italic text-sm">
                    Correct answer not available
                  </p>
                </div>
              )
            )}

            {/* Enhanced Navigation Footer */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300
                    ${currentQuestionIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-md hover:-translate-x-0.5'}
                 `}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold text-sm shadow-xl shadow-blue-600/25 hover:-translate-y-0.5 transition-all duration-300 hover:scale-105"
              >
                {currentQuestionIndex === questions.length - 1 ? (readOnly ? 'Finish' : '🎯 Review & Submit') : 'Next Question'}
                {currentQuestionIndex < questions.length - 1 && <ChevronRight size={16} />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
