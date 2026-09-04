import { prisma } from "./prisma";
import { sendEmail } from "./email";

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

type NotifyArgs = {
  userId: string;
  type:
    | "OFFER_RECEIVED"
    | "OFFER_ACCEPTED"
    | "OFFER_DECLINED"
    | "LISTING_SOLD"
    | "NEW_REVIEW"
    | "MESSAGE_RECEIVED"
    | "SAVED_SEARCH_MATCH"
    | "LISTING_FEATURED";
  title: string;
  body?: string;
  link?: string;
};

// Creates the in-app notification row AND (if configured) sends an email.
// Decoupled on purpose — a missing/broken email setup should never stop the
// in-app notification from showing up.
export async function notify({ userId, type, title, body, link }: NotifyArgs) {
  await prisma.notification.create({
    data: { userId, type, title, body, link },
  });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  const url = link ? `${APP_URL}${link}` : APP_URL;

  await sendEmail(
    user?.email,
    title,
    `<p>${body || title}</p><p><a href="${url}">View on Bench Exchange</a></p>`
  );
}
