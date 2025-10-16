"use client";
import { useState } from "react";

export default function UploadMediaPage() {
  const [file, setFile] = useState(null);
  const [clientId, setClientId] = useState("");
  const [jobCardId, setJobCardId] = useState("");
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Select a file!");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("client_id", clientId);
    formData.append("job_card_id", jobCardId);

    const res = await fetch(process.env.NEXT_PUBLIC_N8N_UPLOAD_URL, { method: "POST", body: formData });
    setMessage(res.ok ? "✅ Uploaded successfully!" : "❌ Upload failed");
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload Job Media</h1>
      <input type="text" placeholder="Client ID" className="border p-2 w-full mb-2" onChange={e => setClientId(e.target.value)} />
      <input type="text" placeholder="Job Card ID" className="border p-2 w-full mb-2" onChange={e => setJobCardId(e.target.value)} />
      <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={handleUpload} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
      <p className="mt-3">{message}</p>
    </div>
  );
}
