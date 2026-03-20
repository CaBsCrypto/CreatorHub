import { Resend } from 'resend';

export async function sendNotificationEmail(subject: string, html: string, to?: string | string[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured, skipping email.");
    return { skip: true, message: "Resend not configured" };
  }

  const resend = new Resend(apiKey);
  
  const recipients = to || [
    'cabscryptocontacto@gmail.com',
    'cnduarte86@gmail.com',
    'lol.eminatr1x@gmail.com'
  ];

  try {
    const { data, error } = await resend.emails.send({
      from: 'Umbra Creator Hub <notifications@resend.dev>',
      to: recipients,
      subject,
      html,
    });

    if (error) {
      console.error("Resend Error Detail:", JSON.stringify(error, null, 2));
      console.error("Attempted recipients:", recipients);
      throw new Error(error.message || "Resend failed to send email");
    }

    console.log("Email sent successfully to:", recipients, "Data:", data);
    return { success: true, data };
  } catch (err: any) {
    console.error("Notification Service Error:", err.message);
    throw err;
  }
}
