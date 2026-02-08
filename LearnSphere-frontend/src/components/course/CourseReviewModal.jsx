import React, { useState } from 'react';
import { Star, X, MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const CourseReviewModal = ({ isOpen, onClose, onSubmitSuccess, courseId, courseTitle, user }) => {
    const [rating, setRating] = useState(0); // Start with 0 to encourage interaction
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please pick a star rating");
            return;
        }

        if (!comment.trim()) {
            toast.error("Please share your thoughts!");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                courseId: Number(courseId),
                studentId: user.studentId,
                userId: user.userId,
                studentName: user.name,
                rating,
                comment
            };

            await reviewService.addReview(payload);
            toast.success("Thanks for your feedback!");
            onSubmitSuccess(); // This will trigger the next modal
        } catch (err) {
            console.error("Submit review failed", err);
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const getRatingLabel = (r) => {
        switch (r) {
            case 5: return "Absolutely Outstanding!";
            case 4: return "Really Good";
            case 3: return "It was Okay";
            case 2: return "Needs Improvement";
            case 1: return "Not for me";
            default: return "Rate this course";
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 border border-white/50 relative">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6">
                    <div className="flex gap-4 items-center relative z-10">
                        <div className="bg-blue-50 p-3 rounded-2xl shadow-sm border border-blue-100">
                            <ThumbsUp className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">
                                Your Opinion Matters
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">Review <span className="text-blue-600">{courseTitle}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100 active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="px-8 pb-8 relative z-10">

                    {/* Stars Interaction */}
                    <div className="flex flex-col items-center justify-center mb-8 bg-slate-50 rounded-2xl p-6 border border-slate-100 group hover:border-blue-100 transition-colors">
                        <div className="flex justify-center gap-2 mb-2" onMouseLeave={() => setHoveredStar(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95 p-1 relative"
                                >
                                    <Star
                                        fill={(hoveredStar || rating) >= star ? "#fbbf24" : "white"}
                                        size={36}
                                        strokeWidth={1.5}
                                        className={`transition-all duration-300 shadow-sm ${(hoveredStar || rating) >= star ? 'text-amber-400 drop-shadow-md' : 'text-slate-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className={`text-sm font-bold tracking-wide transition-all duration-500 h-5 ${(hoveredStar || rating) >= 4 ? 'text-emerald-600 translate-y-0 opacity-100' :
                                (hoveredStar || rating) === 3 ? 'text-amber-500 translate-y-0 opacity-100' :
                                    (hoveredStar || rating) > 0 ? 'text-rose-500 translate-y-0 opacity-100' : 'text-slate-400 opacity-60'
                            }`}>
                            {getRatingLabel(hoveredStar || rating)}
                        </p>
                    </div>

                    <div className="mb-8">
                        {/* <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                            Your Feedback
                        </label> */}
                        <div className="relative group">
                            <textarea
                                className="w-full p-4 pl-5 text-base border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 bg-slate-50 focus:bg-white min-h-[120px]"
                                placeholder="What did you like? How can we improve?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            />
                            <div className="absolute bottom-4 right-4 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
                                <MessageSquare size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 px-6 rounded-xl border border-transparent text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm"
                        >
                            Skip Feedback
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[2] py-3.5 px-6 rounded-xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-900/10 hover:bg-black hover:shadow-slate-900/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Sending...' : (
                                <>
                                    Submit Review <Send size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseReviewModal;
