import axios from 'axios';

const DEFAULT_BACKEND_URL = 'http://localhost:3000/api';
const rawBaseUrl = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const hasVersionInBase = /\/v\d+$/i.test(normalizedBaseUrl);
const apiVersionPrefix = hasVersionInBase ? '' : '/v1';

const withApiVersion = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiVersionPrefix}${normalizedPath}`;
};

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on auth endpoints (login, register) - let them handle errors
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on sign-in page
      if (window.location.pathname !== '/sign-in') {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateUser: (data: any) => api.put('/auth/me', data),
};

// Event APIs
export const eventAPI = {
  createEvent: (data: any) => api.post(withApiVersion('/events'), data),
  getEvents: (params?: any) => api.get(withApiVersion('/events'), { params }),
  getEventBySlug: (slug: string) => api.get(withApiVersion(`/events/${slug}`)),
  getMyEvents: () => api.get(withApiVersion('/events/my/events')),
  getEventDashboard: (eventId: string) => api.get(withApiVersion(`/events/${eventId}/dashboard`)),
  getEventRegistrations: (eventId: string) => api.get(withApiVersion(`/events/${eventId}/registrations`)),
  deleteEvent: (eventId: string) => api.delete(withApiVersion(`/events/${eventId}`)),
  generateEventAI: (prompt: string) => api.post(withApiVersion('/events/generate-ai'), { prompt }),
  checkRegistration: (eventId: string) => api.get(withApiVersion(`/events/${eventId}/check-registration`)),
  registerForEvent: (data: any) => api.post(withApiVersion('/events/register'), data),
  getMyTickets: () => api.get(withApiVersion('/events/user/tickets')),
  checkInAttendee: (qrCode: string) => api.post(withApiVersion('/events/check-in'), { qrCode }),
  cancelRegistration: (registrationId: string) => api.post(withApiVersion(`/events/registrations/${registrationId}/cancel`)),
};

export default api;