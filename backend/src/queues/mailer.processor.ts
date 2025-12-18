import { Job, Worker } from "bullmq";
import { NotificationDto } from "../dto/notification.dto";
import { MAILER_QUEUE } from "./mailer.queue";
import { getRedisConnObject } from "../config/redis.config";
import { MAILER_PAYLOAD } from "./mailer.producer";
import { renderMailTemplate } from "../mail/templates/templates.handler";
import { sendEmail } from "../services/email.transport";
import logger from "../config/logger.config";

export const setupMailerWorker = () => {

  const emailProcessor = new Worker<NotificationDto>(
    MAILER_QUEUE,
    async (job: Job<NotificationDto>) => {

      if (job.name !== MAILER_PAYLOAD) {
        throw new Error("Invalid job name");
      }

      const payload = job.data;

      logger.info(`Processing email job`, payload);

      const emailContent = await renderMailTemplate(
        payload.templateId,
        payload.params
      );

      await sendEmail(
        payload.to,
        payload.subject,
        emailContent
      );
    },
    {
      connection: getRedisConnObject(),
    }
  );

  emailProcessor.on("failed", (job, err) => {
    logger.error("Email job failed", {
      jobId: job?.id,
      error: err,
    });
  });

  emailProcessor.on("completed", (job) => {
    logger.info(`Email job completed`, { jobId: job.id });
  });
};
