// src/lib/sendgrid.ts

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject,
          },
        ],
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || "no-reply@garagecrm.com",
          name: "Garage CRM",
        },
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("❌ SendGrid error:", err);
      throw new Error(`SendGrid API error: ${res.statusText}`);
    }

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}