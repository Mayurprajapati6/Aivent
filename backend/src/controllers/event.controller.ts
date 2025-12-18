import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Event } from "../models/Event";
import { User } from "../models/User";
import { Registration } from "../models/Registration";
import { NotificationService } from "../services";

/* ===================== AI GENERATION ===================== */
export const generateEventAI = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const lowerPrompt = prompt.toLowerCase();
    let category = "community";

    if (lowerPrompt.includes("tech")) category = "tech";
    else if (lowerPrompt.includes("music")) category = "music";
    else if (lowerPrompt.includes("fitness")) category = "health";
    else if (lowerPrompt.includes("food")) category = "food";
    else if (lowerPrompt.includes("art")) category = "art";

    res.json({
      title: prompt.slice(0, 50),
      description: `Inspired by your idea: ${prompt}`,
      category,
      suggestedCapacity: 100,
      suggestedTicketType: lowerPrompt.includes("paid") ? "paid" : "free",
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== CREATE EVENT ===================== */
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const slug =
      req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now();

    const event = await Event.create({
      ...req.body,
      organizer: req.user.id,
      slug,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    });

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { freeEventsCreated: 1 },
    });

    res.status(201).json(event);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== GET EVENTS ===================== */
export const getEvents = async (req: Request, res: Response) => {
  const { category, search, city } = req.query;
  const query: any = {};

  if (category) query.category = category;
  if (city) query.city = { $regex: city, $options: "i" };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const events = await Event.find(query).sort({ startDate: 1 });
  res.json(events);
};

/* ===================== REGISTER FOR EVENT ===================== */
/**
 * SCENARIO #1
 * User registers → email sent (registration accepted)
 */
export const registerForEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, attendeeName, attendeeEmail } = req.body;

    const existing = await Registration.findOne({
      event: eventId,
      user: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ message: "Already registered" });
    }

    const qrCode = `EVT-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 6)}`;

    const registration = await Registration.create({
      event: eventId,
      user: req.user.id,
      attendeeName,
      attendeeEmail,
      qrCode,
      status: "confirmed",
    });

    await Event.findByIdAndUpdate(eventId, {
      $inc: { registrationCount: 1 },
    });

    const event = await Event.findById(eventId).populate("organizer", "name");

    if (event) {
      await NotificationService.sendRegistrationAcceptedEmail({
        email: attendeeEmail,
        userName: attendeeName,
        eventName: event.title,
        organizerName: (event.organizer as any)?.name || "Organizer",
        date: new Date(event.startDate).toDateString(),
        time: new Date(event.startDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        venue: event.venue || event.city || "Venue TBA",
        mapLink: (event as any).mapLink || "",
      });
    }

    res.status(201).json(registration);
  } catch (err: any) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ===================== MY TICKETS ===================== */
export const getMyTickets = async (req: AuthRequest, res: Response) => {
  const tickets = await Registration.find({ user: req.user.id })
    .populate("event")
    .sort({ createdAt: -1 });

  res.json(tickets);
};

/* ===================== CHECK-IN ===================== */
export const checkInAttendee = async (req: AuthRequest, res: Response) => {
  const { qrCode } = req.body;
  const reg = await Registration.findOne({ qrCode }).populate("event");

  if (!reg) return res.status(404).json({ message: "Invalid QR" });

  const regEvent = reg.event as any;
  const regOrganizerId = regEvent?.organizer?._id
    ? regEvent.organizer._id.toString()
    : regEvent?.organizer?.toString();

  if (regOrganizerId !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (reg.checkedIn) {
    return res.status(400).json({ message: "Already checked in" });
  }

  reg.checkedIn = true;
  reg.checkedInAt = new Date();
  await reg.save();

  res.json({ success: true, attendee: reg.attendeeName });
};

/* ===================== DELETE EVENT ===================== */
/**
 * SCENARIO #3
 * Event cancelled → email sent to ALL confirmed users
 */
export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.eventId).populate(
      "organizer",
      "name"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const organizerId =
      (event.organizer as any)?._id?.toString() ||
      (event.organizer as any)?.toString();

    if (organizerId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const registrations = await Registration.find({
      event: event._id,
      status: "confirmed",
    });

    for (const reg of registrations) {
      await NotificationService.sendEventCancelledEmail({
        email: reg.attendeeEmail,
        userName: reg.attendeeName,
        eventName: event.title,
        organizerName: (event.organizer as any)?.name || "Organizer",
        date: new Date(event.startDate).toDateString(),
        time: new Date(event.startDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        venue: event.venue || event.city || "Venue TBA",
        mapLink: (event as any).mapLink || "",
      });
    }

    await Registration.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(event._id);

    res.json({ success: true });
  } catch (err: any) {
    console.error("❌ Delete event error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ===================== GET EVENT BY SLUG ===================== */
export const getEventBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as any;
    const event = await Event.findOne({ slug }).populate("organizer", "name");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== MY EVENTS ===================== */
export const getMyEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).sort({ startDate: -1 });
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== EVENT DASHBOARD ===================== */
export const getEventDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params as any;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    const organizerId = (event.organizer as any)?._id
      ? (event.organizer as any)._id.toString()
      : (event.organizer as any)?.toString();

    if (organizerId !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    const total = await Registration.countDocuments({ event: event._id });
    const confirmed = await Registration.countDocuments({ event: event._id, status: "confirmed" });
    const checkedInCount = await Registration.countDocuments({ event: event._id, checkedIn: true });

    // Compute hours until event
    const now = Date.now();
    const startTime = event.startDate ? new Date(event.startDate).getTime() : now;
    const endTime = event.endDate ? new Date(event.endDate).getTime() : now;
    const diffHours = Math.max(0, Math.round((startTime - now) / (1000 * 60 * 60)));
    const isEventPast = endTime < now;
    const isEventToday = new Date(startTime).toDateString() === new Date(now).toDateString();

    const totalRevenue = event.ticketType === 'paid' ? ((event.registrationCount || 0) * (event.ticketPrice || 0)) : 0;
    const capacity = event.capacity || 0;
    const checkInRate = capacity > 0 ? Math.round((checkedInCount / capacity) * 100) : 0;

    const stats = {
      totalRegistrations: total,
      checkedInCount,
      pendingCount: Math.max(0, confirmed - checkedInCount),
      capacity,
      checkInRate,
      totalRevenue,
      hoursUntilEvent: diffHours,
      isEventToday,
      isEventPast,
    } as any;

    res.json({ event, stats });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== EVENT REGISTRATIONS ===================== */
export const getEventRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params as any;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    const regs = await Registration.find({ event: event._id }).populate("user", "name email").sort({ createdAt: -1 });
    res.json(regs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== CANCEL REGISTRATION ===================== */
export const cancelRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { registrationId } = req.params as any;
    const reg = await Registration.findById(registrationId).populate("event");
    if (!reg) return res.status(404).json({ message: "Registration not found" });

    const event = reg.event as any;
    // allow organizer or the user who registered
    const eventObj = reg.event as any;
    const eventOrganizerId = eventObj?.organizer?._id
      ? eventObj.organizer._id.toString()
      : eventObj?.organizer?.toString();

    if (eventOrganizerId !== req.user.id && reg.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (reg.status === "cancelled") return res.status(400).json({ message: "Already cancelled" });

    reg.status = "cancelled";
    await reg.save();

    if (event.registrationCount && event.registrationCount > 0) {
      await Event.findByIdAndUpdate(event._id, { $inc: { registrationCount: -1 } });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== CHECK REGISTRATION ===================== */
export const checkRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params as any;
    const reg = await Registration.findOne({ event: eventId, user: req.user.id });
    res.json({ registered: !!reg, registration: reg || null });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
