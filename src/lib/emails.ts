import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNotificationEmail(to: string, subject: string, body: string) {
  try {
    const data = await resend.emails.send({
      from: 'calendar-reminder@onresend.com', // You’ll verify this domain in Resend
      to,
      subject,
      html: body,
    });
    return data;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}