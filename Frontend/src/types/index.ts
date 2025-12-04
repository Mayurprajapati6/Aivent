export interface User {
  _id: string;
  email: string;
  name: string;
  imageUrl?: string;
  hasCompletedOnboarding?: boolean;
  location?: {
    city: string;
    state?: string;
    country: string;
  };
  interests?: string[];
  freeEventsCreated: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  slug: string;
  organizer: string | { _id: string; name: string };
  organizerId?: string;
  organizerName?: string;
  category: string;
  tags?: string[];
  startDate: number | string | Date;
  endDate: number | string | Date;
  timezone?: string;
  locationType: 'physical' | 'online';
  venue?: string;
  address?: string;
  city: string;
  state?: string;
  country: string;
  capacity: number;
  ticketType: 'free' | 'paid';
  ticketPrice?: number;
  registrationCount: number;
  coverImage?: string;
  themeColor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Registration {
  _id: string;
  eventId: string;
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: string;
  status: 'confirmed' | 'cancelled';
  registeredAt: string;
  event?: Event;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EventDashboardStats {
  totalRegistrations: number;
  checkedInCount: number;
  pendingCount: number;
  capacity: number;
  checkInRate: number;
  totalRevenue: number;
  hoursUntilEvent: number;
  isEventToday: boolean;
  isEventPast: boolean;
}