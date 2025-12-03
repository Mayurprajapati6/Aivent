import express from 'express';
import authRouter from './auth.router';
import eventRouter from './event.router';

const v1Router = express.Router();

v1Router.use('/auth',authRouter);
v1Router.use('/events',eventRouter);

export default v1Router;