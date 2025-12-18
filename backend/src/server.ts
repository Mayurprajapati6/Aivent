import express from 'express';
import cors from 'cors'
import { serverConfig } from './config';
import { appErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';
import { connectDB } from './config/db';
import v1Router from './routers/v1/index.router';
import { setupMailerWorker } from './queues/mailer.processor';

const app = express();

app.use(cors({
  origin: "http://localhost:5173",   // your React frontend
  credentials: true
}));

app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);
app.use('/api/v1', v1Router);
//app.use('/api/v2', v2Router); 


/**
 * Add the error handler middleware
 */

app.use(appErrorHandler);
app.use(genericErrorHandler);


app.listen(serverConfig.PORT, async () => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    logger.info(`Press Ctrl+C to stop the server.`);

    console.log(`Server is running on http://localhost:${serverConfig.PORT}`)

    await connectDB();

    setupMailerWorker(); 
    logger.info(`Mailer worker setup completed.`);

    
});
