import React, { useState } from 'react';
import { Plus, Trash2, Save, Gift, CheckCircle, ArrowLeft, Settings } from 'lucide-react';
import { quizService } from '../../services/quizService';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';

const QuizBuilder = ({ courseId, topicId, onBack, onSuccess }) => {
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
    ]);
    const [settings, setSettings] = useState({
        title: 'New Quiz',
        duration: 10,
        rewardFirstTry: 10,
        rewardSecondTry: 7,
        rewardThirdTry: 5,
        rewardFourthPlus: 2
    });

    const [showRewardsModal, setShowRewardsModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const activeQuestion = questions[activeQuestionIndex];

    // --- ACTIONS ---

    const addQuestion = () => {
        const newQ = { questionText: '', options: ['', '', '', ''], correctAnswer: '' };
        setQuestions([...questions, newQ]);
        setActiveQuestionIndex(questions.length); // Switch to new question
    };

    const deleteQuestion = (index) => {
        if (questions.length === 1) {
            toast.error("Quiz must have at least one question");
            return;
        }
        const newQs = questions.filter((_, i) => i !== index);
        setQuestions(newQs);
        if (activeQuestionIndex >= newQs.length) {
            setActiveQuestionIndex(newQs.length - 1);
        }
    };

    const updateQuestion = (field, value) => {
        const newQs = [...questions];
        newQs[activeQuestionIndex] = { ...newQs[activeQuestionIndex], [field]: value };
        setQuestions(newQs);
    };

    const updateOption = (optIndex, value) => {
        const newQs = [...questions];
        newQs[activeQuestionIndex].options[optIndex] = value;
        setQuestions(newQs);
    };

    const handleSave = async () => {
        // Validation
        if (!settings.title.trim()) return toast.error("Quiz title is required");

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText.trim()) return toast.error(`Question ${i + 1} text missing`);
            if (q.options.some(o => !o.trim())) return toast.error(`Question ${i + 1} has empty options`);
            if (!q.correctAnswer) return toast.error(`Question ${i + 1} has no correct answer selected`);
        }

        setSaving(true);
        try {
            const payload = {
                courseId,
                topicId,
                ...settings,
                questions
            };

            await quizService.saveManualQuiz(payload);
            toast.success("Quiz created successfully!");
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save quiz");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
            {/* HEADER */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <input
                            value={settings.title}
                            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                            className="text-xl font-bold border-none focus:ring-0 p-0 hover:bg-gray-50 rounded px-2"
                            placeholder="Quiz Title"
                        />
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">⏱️ <input type="number" className="w-12 h-6 border rounded text-xs px-1" value={settings.duration} onChange={e => setSettings({ ...settings, duration: Number(e.target.value) })} /> mins</span>
                            <span>•</span>
                            <span>{questions.length} Questions</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => setShowRewardsModal(true)} icon={Gift}>Rewards</Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving} icon={Save}>
                        {saving ? 'Saving...' : 'Save Quiz'}
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT - SPLIT VIEW */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT PANEL - QUESTION LIST */}
                <div className="w-64 bg-white border-r flex flex-col">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-semibold text-gray-700">Questions</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {questions.map((q, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveQuestionIndex(idx)}
                                className={`p-3 rounded-lg border cursor-pointer group flex items-start gap-3 hover:shadow-sm transition-all
                  ${activeQuestionIndex === idx ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                `}
                            >
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${activeQuestionIndex === idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                                    {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {q.questionText || 'New Question'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {q.options.filter(o => o).length}/4 options
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteQuestion(idx); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-500 rounded transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t">
                        <Button variant="secondary" className="w-full justify-center" icon={Plus} onClick={addQuestion}>
                            Add Question
                        </Button>
                    </div>
                </div>

                {/* RIGHT PANEL - EDITOR */}
                <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
                    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question {activeQuestionIndex + 1}
                            </label>
                            <textarea
                                value={activeQuestion.questionText}
                                onChange={(e) => updateQuestion('questionText', e.target.value)}
                                placeholder="Enter your question here..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-lg"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Options</label>
                            {activeQuestion.options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <button
                                        onClick={() => updateQuestion('correctAnswer', opt)}
                                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                      ${activeQuestion.correctAnswer === opt && opt !== ''
                                                ? 'border-green-500 bg-green-500 text-white'
                                                : 'border-gray-300 hover:border-green-300'}
                    `}
                                        disabled={!opt}
                                        title="Mark as correct answer"
                                    >
                                        {activeQuestion.correctAnswer === opt && opt !== '' && <CheckCircle size={14} />}
                                    </button>
                                    <input
                                        value={opt}
                                        onChange={(e) => updateOption(idx, e.target.value)}
                                        placeholder={`Option ${idx + 1}`}
                                        className={`flex-1 px-4 py-2 rounded-lg border transition-all
                      ${activeQuestion.correctAnswer === opt && opt !== ''
                                                ? 'border-green-500 bg-green-50 ring-1 ring-green-200'
                                                : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
                    `}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t flex justify-between text-sm text-gray-500">
                            <p>Mark the correct answer by clicking the circle next to the option.</p>
                            {activeQuestion.correctAnswer ? (
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                    <CheckCircle size={16} /> Correct answer selected
                                </span>
                            ) : (
                                <span className="text-orange-500 font-medium">Please select a correct answer</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* REWARDS MODAL */}
            {showRewardsModal && (
                <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Gift size={20} /> Reward Settings
                            </h3>
                            <button onClick={() => setShowRewardsModal(false)} className="text-white/80 hover:text-white">
                                <Settings size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                Set the points students earn based on how many attempts it takes them to pass.
                            </p>

                            <div className="space-y-3">
                                {[
                                    { label: 'First Try', field: 'rewardFirstTry', bg: 'bg-green-50 text-green-700' },
                                    { label: 'Second Try', field: 'rewardSecondTry', bg: 'bg-blue-50 text-blue-700' },
                                    { label: 'Third Try', field: 'rewardThirdTry', bg: 'bg-yellow-50 text-yellow-700' },
                                    { label: 'Fourth Try & More', field: 'rewardFourthPlus', bg: 'bg-gray-50 text-gray-700' },
                                ].map((item) => (
                                    <div key={item.field} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                                        <span className={`text-sm font-medium px-2 py-1 rounded ${item.bg} min-w-[100px] text-center`}>
                                            {item.label}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={settings[item.field]}
                                                onChange={(e) => setSettings({ ...settings, [item.field]: Number(e.target.value) })}
                                                className="w-20 px-2 py-1 border rounded text-right font-mono"
                                            />
                                            <span className="text-sm text-gray-500">pts</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end">
                            <Button onClick={() => setShowRewardsModal(false)}>Done</Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default QuizBuilder;
