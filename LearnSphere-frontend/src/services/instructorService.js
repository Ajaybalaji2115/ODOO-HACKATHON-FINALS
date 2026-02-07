import api from './api';

const instructorService = {
    getInstructorDashboard: () => api.get('/instructor/dashboard'),

    contactAdmin: (data) => api.post('/instructor/contact-admin', data),
};

export default instructorService;
