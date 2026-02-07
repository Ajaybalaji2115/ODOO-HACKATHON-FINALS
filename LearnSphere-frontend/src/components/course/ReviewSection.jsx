import React, { useState, useEffect } from 'react';
import { Star, User, MessageSquare } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const ReviewSection = ({ courseId, user, isEnrolled }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [courseId]);

    const fetchReviews = async () => {
        try {
            const res = await reviewService.getReviewsByCourse(courseId);
            setReviews(res.data || []);
        } catch (err) {
            console.error("Failed to load reviews", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast.error("Please add a comment");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                courseId: Number(courseId),
                studentId: user.studentId,
                userId: user.userId, // Send userId
                studentName: user.name,
                rating,
                comment
            };

            await reviewService.addReview(payload);
            toast.success("Review submitted!");
            setShowForm(false);
            setComment('');
            setRating(5);
            fetchReviews(); // Refresh list
        } catch (err) {
            console.error("Submit review failed", err);
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const hasUserReviewed = reviews.some(r => r.studentId === user?.studentId);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="text-blue-500" />
                    Student Reviews ({reviews.length})
                </h2>

                {/* Write Review Button - Only if Student, Enrolled, and Validation Check */}
                {user?.role === 'STUDENT' && isEnrolled && !hasUserReviewed && !showForm && (
                    <Button onClick={() => setShowForm(true)} size="sm">
                        Write a Review
                    </Button>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-semibold text-gray-800 mb-3">Write your review</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    <Star fill={star <= rating ? "currentColor" : "none"} size={28} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Post Review'}
                        </Button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            {loading ? (
                <p className="text-gray-500 text-center py-4">Loading reviews...</p>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        {review.studentName?.charAt(0).toUpperCase() || <User size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{review.studentName || 'Student'}</h4>
                                        <div className="flex text-yellow-400 text-xs">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-2 text-gray-600 text-sm leading-relaxed pl-13 ml-12">
                                {review.comment}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
