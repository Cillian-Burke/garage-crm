// src/lib/sendgrid.ts
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

  if (!SENDGRID_API_KEY) {
    console.error("❌ Missing SENDGRID_API_KEY in environment variables.");
    throw new Error("SENDGRID_API_KEY not configured.");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: {
        email: "no-reply@garagecrm.com",
        name: "Garage CRM",
      },
      content: [
        {
          type: "text/html",
          value: html,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ SendGrid error:", errorText);
    throw new Error(`SendGrid request failed: ${response.statusText}`);
  }

  console.log(`✅ Email sent successfully to ${to}`);
}