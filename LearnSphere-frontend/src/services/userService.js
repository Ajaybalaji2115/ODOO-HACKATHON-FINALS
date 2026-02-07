import api from './api'

export const userService = {
    getAdminUsers: async () => {
        // This endpoint might be restricted to ADMIN role.
        // If current user is INSTRUCTOR, this might fail (403).
        // The UI should handle emptiness gracefully.
        return api.get('/admin/users')
    },

    // Add other user related methods here as needed
    getUserProfile: () => api.get('/profile')
}
