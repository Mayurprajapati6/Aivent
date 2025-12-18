import express from 'express';
import { checkInAttendee, createEvent, getEventBySlug, getEvents, getMyTickets, registerForEvent, getMyEvents, getEventDashboard, getEventRegistrations, deleteEvent, cancelRegistration, checkRegistration, generateEventAI,} from '../../controllers/event.controller';
import { protect } from '../../middlewares/auth.middleware';

const eventRouter = express.Router();

//public
eventRouter.post('/generate-ai', protect, (req, res, next) => {
  void generateEventAI(req, res).catch(next);
});
eventRouter.get('/',getEvents);
eventRouter.get('/my/events',protect,getMyEvents);
eventRouter.get('/user/tickets',protect,getMyTickets);

//protected - specific routes first
eventRouter.post('/',protect,createEvent);
eventRouter.post('/register',protect,(req, res, next) => { void registerForEvent(req, res).catch(next); });
eventRouter.post('/check-in',protect,(req, res, next) => { void checkInAttendee(req, res).catch(next); }); // for organizer
eventRouter.post('/registrations/:registrationId/cancel',protect,(req, res, next) => { void cancelRegistration(req, res).catch(next); });
eventRouter.get('/:eventId/check-registration',protect,checkRegistration);
eventRouter.get('/:eventId/dashboard',protect,(req, res, next) => { void getEventDashboard(req, res).catch(next); });
eventRouter.get('/:eventId/registrations',protect,(req, res, next) => { void getEventRegistrations(req, res).catch(next); });
eventRouter.delete('/:eventId',protect,(req, res, next) => { void deleteEvent(req, res).catch(next); });

//slug route must be last
eventRouter.get('/:slug', (req, res, next) => { void getEventBySlug(req, res).catch(next); });



export default eventRouter;