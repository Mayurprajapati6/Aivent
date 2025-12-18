import transporter from "../config/mailer.config";
import { serverConfig } from "../config";
import logger from "../config/logger.config";

export async function sendEmail(
  to: string,
  subject: string,
  body: string
) {
  await transporter.sendMail({
    from: `"Aivent" <${serverConfig.MAIL_USER}>`,
    to,
    subject,
    html: body,
  });

  logger.info(`Email sent to ${to} | subject=${subject}`);
}
