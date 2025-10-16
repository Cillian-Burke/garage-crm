import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SettingsPage() {
  const [daysNotice, setDaysNotice] = useState(7);
  const [outreachEnabled, setOutreachEnabled] = useState(true);
  const [outreachSendHour, setOutreachSendHour] = useState(9);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientSettings = async () => {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      const { data, error } = await supabase
        .from("clients")
        .select("id, days_notice, outreach_enabled, outreach_send_hour")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setClientId(data.id);
        setDaysNotice(data.days_notice || 7);
        setOutreachEnabled(data.outreach_enabled ?? true);
        setOutreachSendHour(data.outreach_send_hour || 9);
      }
      setLoading(false);
    };

    fetchClientSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("clients")
      .update({
        days_notice: daysNotice,
        outreach_enabled: outreachEnabled,
        outreach_send_hour: outreachSendHour,
      })
      .eq("id", clientId);

    if (error) {
      alert("❌ Error saving settings: " + error.message);
    } else {
      alert("✅ Settings saved successfully!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-bold mb-4">Outreach Settings</h1>

      <label className="block mb-2 font-medium">Days Notice</label>
      <input
        type="number"
        min="1"
        max="30"
        className="border rounded p-2 w-full mb-4"
        value={daysNotice}
        onChange={(e) => setDaysNotice(Number(e.target.value))}
      />

      <label className="block mb-2 font-medium">Preferred Send Hour</label>
      <select
        className="border rounded p-2 w-full mb-4"
        value={outreachSendHour}
        onChange={(e) => setOutreachSendHour(Number(e.target.value))}
      >
        {[...Array(24).keys()].map((hour) => (
          <option key={hour} value={hour}>
            {hour}:00
          </option>
        ))}
      </select>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={outreachEnabled}
          onChange={() => setOutreachEnabled(!outreachEnabled)}
          className="mr-2"
        />
        <label className="font-medium">Enable Automatic Outreach</label>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full px-4 py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
