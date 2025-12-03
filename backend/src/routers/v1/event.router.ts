import express from 'express';
import { checkInAttendee, createEvent, getEventBySlug, getEvents, getMyTickets, registerForEvent } from '../../controllers/event.controller';
import { protect } from '../../middlewares/auth.middleware';

const eventRouter = express.Router();

//public
eventRouter.get('/',getEvents);

eventRouter.post('/',protect,createEvent);
eventRouter.post('/register',protect,(req, res, next) => { void registerForEvent(req, res).catch(next); });
eventRouter.get('/user/tickets',protect,getMyTickets);
eventRouter.post('/check-in',protect,(req, res, next) => { void checkInAttendee(req, res).catch(next); }); // for organizer
eventRouter.get('/:slug', getEventBySlug);



export default eventRouter;