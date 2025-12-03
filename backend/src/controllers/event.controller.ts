import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Event } from "../models/Event";
import { User } from "../models/User";
//import { GoogleGenerativeAI } from '@google/generative-ai';
import { Registration } from "../models/Registration";

// --- AI Generation ---
// export const generateEventAI = async (req: Request, res: Response) => {
//   try {
//     const { prompt } = req.body;
//     if (!process.env.GEMINI_API_KEY) throw new Error("No API Key");
    
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//     const systemPrompt = `You are an event planner. Generate JSON: {"title": "str", "description": "str", "category": "str", "suggestedCapacity": num, "suggestedTicketType": "free"|"paid"}. Idea: ${prompt}`;
    
//     const result = await model.generateContent(systemPrompt);
//     const text = result.response.text().replace(/```json|```/g, '').trim();
    
//     res.json(JSON.parse(text));
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

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

    res.status(201).json(registration);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response) => {
    const tickets = await Registration.find({ user: req.user.id }).populate('event').sort({ createdAt: -1 });
    res.json(tickets);
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
  await reg.save();

  return res.json({ success: true, attendee: reg.attendeeName });
};
