import api from './api'

export const reviewService = {
    async getReviewsByCourse(courseId) {
        const response = await api.get(`/reviews/course/${courseId}`)
        return response.data
    },

    async addReview(reviewData) {
        const response = await api.post('/reviews', reviewData)
        return response.data
    }
}
