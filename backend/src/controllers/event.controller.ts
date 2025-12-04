import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Event } from "../models/Event";
import { User } from "../models/User";
//import { GoogleGenerativeAI } from '@google/generative-ai';
import { Registration } from "../models/Registration";

//--- AI Generation (fallback heuristic) ---
export const generateEventAI = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const lowerPrompt = prompt.toLowerCase();
    let category = "community";
    if (lowerPrompt.includes("tech") || lowerPrompt.includes("developer")) {
      category = "tech";
    } else if (lowerPrompt.includes("music") || lowerPrompt.includes("concert")) {
      category = "music";
    } else if (lowerPrompt.includes("fitness") || lowerPrompt.includes("run")) {
      category = "health";
    } else if (lowerPrompt.includes("food") || lowerPrompt.includes("chef")) {
      category = "food";
    } else if (lowerPrompt.includes("art") || lowerPrompt.includes("gallery")) {
      category = "art";
    }

    const title =
      prompt.length > 50
        ? `${prompt.slice(0, 47).trim()}...`
        : prompt.trim().replace(/^\w/, (c) => c.toUpperCase()) || "Custom Event";

    const responsePayload = {
      title,
      description: `Inspired by your idea: ${prompt}`,
      category,
      suggestedCapacity: lowerPrompt.includes("intimate") ? 40 : 120,
      suggestedTicketType: lowerPrompt.includes("paid") ? "paid" : "free",
    };

    res.json(responsePayload);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "AI generator failed" });
  }
};

// --- CRUD ---
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const event = await Event.create({
      ...req.body,
      organizer: req.user.id,
      slug,
      startDate: new Date(req.body.startDate), // Ensure dates are parsed
      endDate: new Date(req.body.endDate)
    });
    
    await User.findByIdAndUpdate(req.user.id, { $inc: { freeEventsCreated: 1 } });
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  const { category, search, city } = req.query;
  let query: any = {};

  if (category) query.category = category;
  if (city) query.city = { $regex: city, $options: 'i' };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const events = await Event.find(query).sort({ startDate: 1 });
  res.json(events);
};

export const getEventBySlug = async (req: Request, res: Response) => {
  const event = await Event.findOne({ slug: req.params.slug }).populate('organizer', 'name');
  if (event) res.json(event);
  else res.status(404).json({ message: 'Event not found' });
};

// --- Registrations ---
export const registerForEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, attendeeName, attendeeEmail } = req.body;
    const existing = await Registration.findOne({ event: eventId, user: req.user.id });
    
    if (existing) return res.status(400).json({ message: 'Already registered' });

    const qrCode = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const registration = await Registration.create({
      event: eventId,
      user: req.user.id,
      attendeeName,
      attendeeEmail,
      qrCode,
      status: 'confirmed'
    });

    await Event.findByIdAndUpdate(eventId, { $inc: { registrationCount: 1 } });

    // Map registration to ensure registeredAt field exists and all dates are valid
    const mappedRegistration = {
      _id: registration._id,
      eventId: registration.event?._id || registration.event,
      userId: registration.user?._id || registration.user,
      attendeeName: registration.attendeeName,
      attendeeEmail: registration.attendeeEmail,
      qrCode: registration.qrCode,
      checkedIn: registration.checkedIn || false,
      checkedInAt: registration.checkedInAt ? new Date(registration.checkedInAt).toISOString() : undefined,
      status: registration.status,
      registeredAt: (registration as any).createdAt ? new Date((registration as any).createdAt).toISOString() : new Date().toISOString(),
      event: registration.event
    };

    res.status(201).json(mappedRegistration);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response) => {
    const tickets = await Registration.find({ user: req.user.id }).populate('event').sort({ createdAt: -1 });
    
    // Map tickets to ensure registeredAt field exists and all dates are valid
    const mappedTickets = tickets.map((ticket: any) => ({
      _id: ticket._id,
      eventId: ticket.event?._id || ticket.event,
      userId: ticket.user?._id || ticket.user,
      attendeeName: ticket.attendeeName,
      attendeeEmail: ticket.attendeeEmail,
      qrCode: ticket.qrCode,
      checkedIn: ticket.checkedIn || false,
      checkedInAt: ticket.checkedInAt ? new Date(ticket.checkedInAt).toISOString() : undefined,
      status: ticket.status,
      registeredAt: ticket.createdAt ? new Date(ticket.createdAt).toISOString() : new Date().toISOString(),
      event: ticket.event
    }));
    
    res.json(mappedTickets);
};

export const checkInAttendee = async (req: AuthRequest, res: Response) => {
  console.log("calling checkInAttendee");
  console.log(req.body);

  const { qrCode } = req.body;
  const reg = await Registration.findOne({ qrCode }).populate('event');

  if (!reg) return res.status(404).json({ message: 'Invalid QR' });

  // Verify user is organizer
  if ((reg.event as any).organizer.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  console.log("Attendee name:", reg.attendeeName);  // <-- move this up

  if (reg.checkedIn) {
    return res.status(400).json({ message: 'Already checked in' });
  }

  reg.checkedIn = true;
  reg.checkedInAt = new Date();
  await reg.save();

  // Map registration to ensure registeredAt field exists and all dates are valid
  const mappedRegistration = {
    _id: reg._id,
    eventId: (reg.event as any)?._id || reg.event,
    userId: reg.user?._id || reg.user,
    attendeeName: reg.attendeeName,
    attendeeEmail: reg.attendeeEmail,
    qrCode: reg.qrCode,
    checkedIn: reg.checkedIn,
    checkedInAt: reg.checkedInAt ? new Date(reg.checkedInAt).toISOString() : undefined,
    status: reg.status,
    registeredAt: (reg as any).createdAt ? new Date((reg as any).createdAt).toISOString() : new Date().toISOString(),
    event: reg.event
  };

  return res.json({ success: true, attendee: reg.attendeeName, registration: mappedRegistration });
};

export const getMyEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const registrations = await Registration.find({ event: event._id, status: 'confirmed' }).populate('user', 'name email');
    
    const totalRegistrations = registrations.length;
    const checkedInCount = registrations.filter(r => r.checkedIn).length;
    const pendingCount = totalRegistrations - checkedInCount;
    
    let totalRevenue = 0;
    if (event.ticketType === 'paid' && event.ticketPrice) {
      totalRevenue = checkedInCount * event.ticketPrice;
    }
    
    const checkInRate = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;
    
    const now = Date.now();
    const timeUntilEvent = event.startDate.getTime() - now;
    const hoursUntilEvent = Math.max(0, Math.floor(timeUntilEvent / (1000 * 60 * 60)));
    
    const today = new Date().setHours(0, 0, 0, 0);
    const startDay = new Date(event.startDate).setHours(0, 0, 0, 0);
    const endDay = new Date(event.endDate).setHours(0, 0, 0, 0);
    const isEventToday = today >= startDay && today <= endDay;
    const isEventPast = event.endDate.getTime() < now;

    res.json({
      event,
      stats: {
        totalRegistrations,
        checkedInCount,
        pendingCount,
        capacity: event.capacity,
        checkInRate,
        totalRevenue,
        hoursUntilEvent,
        isEventToday,
        isEventPast,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const registrations = await Registration.find({ event: event._id, status: 'confirmed' }).populate('user', 'name email');
    
    // Map registrations to ensure registeredAt field exists and all dates are valid
    const mappedRegistrations = registrations.map((reg: any) => ({
      _id: reg._id,
      eventId: reg.event?._id || reg.event,
      userId: reg.user?._id || reg.user,
      attendeeName: reg.attendeeName,
      attendeeEmail: reg.attendeeEmail,
      qrCode: reg.qrCode,
      checkedIn: reg.checkedIn || false,
      checkedInAt: reg.checkedInAt ? new Date(reg.checkedInAt).toISOString() : undefined,
      status: reg.status,
      registeredAt: reg.createdAt ? new Date(reg.createdAt).toISOString() : new Date().toISOString(),
      event: reg.event
    }));
    
    res.json(mappedRegistrations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all registrations
    await Registration.deleteMany({ event: event._id });
    
    // Update user's free event count if needed
    if (event.ticketType === 'free') {
      const user = await User.findById(req.user.id);
      if (user && user.freeEventsCreated > 0) {
        user.freeEventsCreated -= 1;
        await user.save();
      }
    }

    await Event.findByIdAndDelete(event._id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const registration = await Registration.findById(req.params.registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Decrement event registration count
    await Event.findByIdAndUpdate(registration.event, { $inc: { registrationCount: -1 } });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const checkRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const registration = await Registration.findOne({ 
      event: req.params.eventId, 
      user: req.user.id,
      status: 'confirmed'
    }).populate('event');
    
    res.json(registration);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
