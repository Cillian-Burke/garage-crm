"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmBookingPage() {
  const [status, setStatus] = useState("Confirming booking...");
  const [statusType, setStatusType] = useState("loading"); // "loading", "success", or "error"

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("bookingId");
    const start = params.get("start");
    const end = params.get("end");

    if (!bookingId) {
      setStatusType("error");
      setStatus("❌ No booking ID found.");
      return;
    }

    confirmBooking(bookingId, start, end);
  }, []);

  const confirmBooking = async (bookingId, start, end) => {
    try {
      const res = await fetch("/api/confirmBooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, start, end }),
      });

      const result = await res.json();

      if (res.ok) {
        setStatusType("success");
        setStatus("✅ Booking confirmed! Confirmation email sent.");
      } else {
        setStatusType("error");
        setStatus("❌ Failed to confirm booking: " + (result.error || ""));
      }
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatus("❌ Error confirming booking.");
    }
  };

  const getStatusColor = () => {
    switch (statusType) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center"
        >
          <motion.h1
            className={`text-2xl font-semibold mb-4 ${getStatusColor()}`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1.05 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 8,
            }}
          >
            {status}
          </motion.h1>

          {statusType === "loading" && (
            <motion.div
              className="h-6 w-6 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}

          <a
            className="mt-6 text-blue-600 underline hover:text-blue-800 transition"
            href="/"
          >
            Return to site
          </a>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
