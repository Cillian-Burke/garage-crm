// Optional proxy endpoint if you want to hide n8n URLs. Not used by default.
export default async function handler(req, res) {
  const target = process.env.NEXT_PUBLIC_N8N_UPLOAD_URL;
  const response = await fetch(target, { method: req.method, headers: req.headers, body: req.body });
  const text = await response.text();
  res.status(response.status).send(text);
}
