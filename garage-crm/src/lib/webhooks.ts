export async function triggerWebhook(url: string, payload: Record<string, any>) {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(`✅ Webhook sent to ${url}`);
  } catch (err) {
    console.error(`❌ Failed to send webhook to ${url}:`, err);
  }
}