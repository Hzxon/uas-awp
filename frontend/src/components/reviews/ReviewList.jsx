import React, { useState, useEffect } from 'react';
import { reviewApi } from '../../api';

const ReviewList = ({ outletId, token, isPartner = false }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await reviewApi.getOutletReviews(outletId);
                setReviews(res.reviews || []);
                setStats(res.stats);
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
            } finally {
                setLoading(false);
            }
        };
        if (outletId) fetchReviews();
    }, [outletId]);

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return;

        setSubmittingReply(true);
        try {
            await reviewApi.reply(token, reviewId, replyText);
            // Refresh reviews
            const res = await reviewApi.getOutletReviews(outletId);
            setReviews(res.reviews || []);
            setReplyingTo(null);
            setReplyText('');
        } catch (err) {
            alert(err.message || 'Gagal mengirim balasan');
        } finally {
            setSubmittingReply(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={`fas fa-star text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    ></i>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-pink-500"></i>
            </div>
        );
    }

    return (
        <div>
            {/* Rating Summary */}
            {stats && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-gray-900">{(stats.average || 0).toFixed(1)}</p>
                            {renderStars(Math.round(stats.average || 0))}
                            <p className="text-sm text-gray-500 mt-1">{stats.total || 0} ulasan</p>
                        </div>
                        <div className="flex-1 space-y-1">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = stats[`${['one', 'two', 'three', 'four', 'five'][star - 1]}_star`] || 0;
                                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 w-6">{star}</span>
                                        <i className="fas fa-star text-yellow-400 text-sm"></i>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-500 w-8">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-comments text-4xl text-gray-300 mb-3"></i>
                    <p>Belum ada ulasan</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                                        <i className="fas fa-user text-pink-500"></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{review.user_name || 'Pelanggan'}</p>
                                        <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                                    </div>
                                </div>
                                {renderStars(review.rating)}
                            </div>

                            {review.comment && (
                                <p className="text-gray-700 mb-4">{review.comment}</p>
                            )}

                            {/* Partner Reply */}
                            {review.reply && (
                                <div className="bg-gray-50 rounded-lg p-4 mt-4 border-l-4 border-pink-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <i className="fas fa-store text-pink-500"></i>
                                        <span className="font-semibold text-gray-900">Balasan Pemilik</span>
                                        {review.replied_at && (
                                            <span className="text-xs text-gray-500">{formatDate(review.replied_at)}</span>
                                        )}
                                    </div>
                                    <p className="text-gray-700">{review.reply}</p>
                                </div>
                            )}

                            {/* Reply Form (Partner Only) */}
                            {isPartner && !review.reply && (
                                <div className="mt-4">
                                    {replyingTo === review.id ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 resize-none"
                                                rows={3}
                                                placeholder="Tulis balasan Anda..."
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setReplyingTo(null)}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    onClick={() => handleReply(review.id)}
                                                    disabled={submittingReply}
                                                    className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm disabled:opacity-50"
                                                >
                                                    {submittingReply ? 'Mengirim...' : 'Kirim Balasan'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setReplyingTo(review.id)}
                                            className="text-pink-500 text-sm font-medium hover:text-pink-600"
                                        >
                                            <i className="fas fa-reply mr-1"></i>
                                            Balas
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewList;
