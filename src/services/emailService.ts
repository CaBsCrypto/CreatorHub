import { Resend } from 'resend';

export async function sendNotificationEmail(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured, skipping email.");
    return { skip: true, message: "Resend not configured" };
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Umbra Creator Hub <notifications@resend.dev>',
      to: ['cabscryptocontacto@gmail.com'],
      subject,
      html,
    });

    if (error) {
      console.error("Resend Error:", error);
      throw error;
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Notification failed:", err.message);
    throw err;
  }
}
