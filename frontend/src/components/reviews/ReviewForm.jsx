import React, { useState } from 'react';
import { reviewApi } from '../../api';

const ReviewForm = ({ token, orderId, onSuccess, onCancel }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await reviewApi.create(token, {
                order_id: orderId,
                rating,
                comment
            });
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'Gagal mengirim review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
                <i className="fas fa-star text-yellow-500 mr-2"></i>
                Beri Ulasan
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Star Rating */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="text-3xl transition-transform hover:scale-110"
                            >
                                <i className={`fas fa-star ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {rating === 1 && 'Sangat Buruk'}
                        {rating === 2 && 'Buruk'}
                        {rating === 3 && 'Cukup'}
                        {rating === 4 && 'Bagus'}
                        {rating === 5 && 'Sangat Bagus'}
                    </p>
                </div>

                {/* Comment */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Komentar (Opsional)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Ceritakan pengalaman Anda dengan layanan ini..."
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                        >
                            Batal
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 disabled:opacity-50"
                    >
                        {loading ? (
                            <><i className="fas fa-spinner fa-spin mr-2"></i>Mengirim...</>
                        ) : (
                            <><i className="fas fa-paper-plane mr-2"></i>Kirim Ulasan</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
