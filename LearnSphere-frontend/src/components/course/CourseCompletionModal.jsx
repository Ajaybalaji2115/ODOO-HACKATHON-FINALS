import React, { useEffect, useState } from 'react';
import { Award, Sparkles, ArrowRight, Clock, Star, CheckCircle, Home, X, PlayCircle, BarChart } from 'lucide-react';

const CourseCompletionModal = ({
    isOpen,
    onClose,
    courseTitle,
    recommendation,
    onNavigate
}) => {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setShowContent(true), 100);
            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">

            {/* Main Container - Light Theme "Dashboard" Style */}
            <div className={`w-full max-w-4xl bg-white shadow-2xl rounded-none sm:rounded-2xl overflow-hidden relative transition-all duration-500 ease-out border border-slate-100 ${showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row min-h-[550px] md:h-[550px]">

                    {/* Left Column: Stats & Celebration */}
                    <div className="w-full md:w-5/12 p-8 md:p-10 flex flex-col relative overflow-hidden text-white">

                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src="/images/default-banner.png"
                                alt="LearnSphere Banner"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
                        </div>

                        {/* Content (z-10 to stay above image) */}
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6 border border-white/10 w-fit">
                                <CheckCircle size={14} className="fill-white/20 text-white" /> Completed
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight tracking-tight">
                                Course <br />
                                <span className="text-blue-400">Conquered!</span>
                            </h1>

                            <p className="text-slate-200 text-lg leading-relaxed mb-8">
                                You've successfully finished <span className="font-bold text-white">{courseTitle}</span>.
                            </p>

                            {/* Vertical Stats */}
                            <div className="space-y-4 mb-8">
                                <div className="bg-white/10 p-4 rounded-xl border border-white/20 shadow-sm flex items-center gap-4 backdrop-blur-md">
                                    <div className="p-3 bg-white/20 text-white rounded-lg">
                                        <BarChart size={24} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">100%</p>
                                        <p className="text-xs text-slate-300 font-bold uppercase tracking-wide">Progress</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <button
                                    onClick={() => onNavigate('/dashboard')}
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white hover:text-slate-900 transition-all font-bold text-sm w-full"
                                >
                                    <Home size={16} /> Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Right Column: Next Recommendation (Clean Card Style) */}
                    <div className="w-full md:w-7/12 relative flex flex-col bg-white">

                        {recommendation ? (
                            <div className="flex flex-col h-full">

                                {/* Hero Image Section */}
                                <div className="h-64 relative overflow-hidden group">
                                    <img
                                        src={recommendation.thumbnailUrl}
                                        alt={recommendation.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                    <div className="absolute bottom-4 left-6 right-6">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm mb-2">
                                            <Sparkles size={10} fill="currentColor" /> Best Match
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 p-8 md:p-10 flex flex-col">
                                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium mb-3">
                                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">
                                            <Clock size={14} /> {recommendation.duration || 60} min
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${recommendation.difficultyLevel === 'BEGINNER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            recommendation.difficultyLevel === 'INTERMEDIATE' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-rose-50 text-rose-700 border-rose-100'
                                            }`}>
                                            {recommendation.difficultyLevel}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-900 mb-2 line-clamp-2">
                                        {recommendation.title}
                                    </h3>

                                    <div className="flex items-center gap-1 mb-6">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                                        ))}
                                        <span className="text-slate-400 text-sm ml-2 font-medium">(4.9)</span>
                                    </div>

                                    <p className="text-slate-500 text-sm line-clamp-2 mb-8">
                                        Continue your learning journey with this highly rated course selected just for you.
                                    </p>

                                    <div className="mt-auto">
                                        <button
                                            onClick={() => onNavigate(`/courses/${recommendation.id}`)}
                                            className="group flex items-center justify-center gap-3 w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-[0.98]"
                                        >
                                            <PlayCircle size={20} className="fill-white/20" />
                                            Start Next Course
                                        </button>
                                        <p className="text-center text-slate-400 text-xs mt-3">
                                            <ArrowRight size={12} className="inline mr-1" /> Auto-recommended by AI
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Empty state remains clean
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 ring-1 ring-slate-100">
                                    <CheckCircle size={32} className="text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">You've completed everything on your list. Time to explore something new.</p>
                                <button
                                    onClick={() => onNavigate('/courses')}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                                >
                                    Browse Catalog
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CourseCompletionModal;
