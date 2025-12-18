import { addEmailToQueue } from "../queues/mailer.producer";
import { MailTemplate } from "../mail/templates/template.constants";

export class NotificationService {

  /* ===================== SUBSCRIPTION ===================== */
  static async sendSubscriptionEmail(payload: {
    email: string;
    name: string;
    planName: string;
    startDate: string;
    endDate: string;
    dashboardLink?: string;
  }) {
    await addEmailToQueue({
      to: payload.email,
      subject: "Subscription Activated 🎉",
      templateId: MailTemplate.SUBSCRIPTION_SUCCESS,
      params: {
        name: payload.name,
        planName: payload.planName,
        startDate: payload.startDate,
        endDate: payload.endDate,
        dashboardLink: payload.dashboardLink || "https://aivent.app/dashboard",
        appName: "Aivent",
      },
    });
  }

  /* ===================== REGISTRATION ACCEPTED ===================== */
  static async sendRegistrationAcceptedEmail(payload: {
    email: string;
    userName: string;
    eventName: string;
    organizerName: string;
    date: string;
    time: string;
    venue: string;
    mapLink?: string;
  }) {
    await addEmailToQueue({
      to: payload.email,
      subject: "Your Event Registration is Accepted ✅",
      templateId: MailTemplate.REGISTRATION_ACCEPTED,
      params: {
        userName: payload.userName,
        eventName: payload.eventName,
        organizerName: payload.organizerName,
        date: payload.date,
        time: payload.time,
        venue: payload.venue,
        mapLink: payload.mapLink || "",
        appName: "Aivent",
      },
    });
  }

  /* ===================== EVENT CANCELLED ===================== */
  static async sendEventCancelledEmail(payload: {
    email: string;
    userName: string;
    eventName: string;
    organizerName: string;
    date: string;
    time: string;
    venue: string;
    mapLink?: string;
  }) {
    await addEmailToQueue({
      to: payload.email,
      subject: "Event Cancelled ⚠️",
      templateId: MailTemplate.EVENT_CANCELLED,
      params: {
        userName: payload.userName,
        eventName: payload.eventName,
        organizerName: payload.organizerName,
        date: payload.date,
        time: payload.time,
        venue: payload.venue,
        mapLink: payload.mapLink || "",
        appName: "Aivent",
      },
    });
  }
}
