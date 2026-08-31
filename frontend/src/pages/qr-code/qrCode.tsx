import { useEffect, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { useParams } from "react-router";
import QRCodeComponent from "react-qr-code";
import { Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { getRoomQRCode } from "../../API/rooms-api";

interface QRCodeData {
  id: number;
  name: string;
  price: number;
  capacity: number;
  features: string[];
  qr_instructions: string[];
}

export function QRCode(): JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QRCodeData | null>(null);

  useEffect(() => {
    if (!roomId) {
      setError("Room ID is required");
      setLoading(false);
      return;
    }

    getRoomQRCode(roomId)
      .then((response) => {
        setData(response);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Failed to load room QR code data"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [roomId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-green-500" size={32} />
          <p className="text-sm font-semibold text-neutral-600">
            Loading room data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-red-600">Room Not Found</h2>
          <p className="mt-2 text-sm text-neutral-600">
            {error || "The requested room does not exist."}
          </p>
        </div>
      </div>
    );
  }

  const bookingUrl = `${window.location.origin}/bookings/${data.id}`;

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Top Section - Room Name, Capacity, Price */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative mb-6 overflow-hidden rounded-xl shadow-lg"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2000')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/70 to-neutral-900/50"></div>
          </div>

          {/* Content */}
          <div className="relative p-8 text-white">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold drop-shadow-lg">
                {data.name}
              </h1>
              <div className="flex flex-col items-end gap-2">
                <span className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                  <Users size={18} />
                  <span className="text-sm font-semibold">
                    {data.capacity} {data.capacity === 1 ? "guest" : "guests"}
                  </span>
                </span>
                <div className="text-right">
                  <p className="text-3xl font-bold drop-shadow-lg">
                    Rp {data.price.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm opacity-90">per night</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section - Two Columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Combined Features & Instructions */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            {/* Features */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-neutral-800">
                Features
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {data.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-neutral-700"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            {data.qr_instructions.length > 0 && (
              <div className="my-6 h-px w-full bg-neutral-200"></div>
            )}

            {/* Instructions */}
            {data.qr_instructions.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-neutral-800">
                  Instructions
                </h2>
                <ol className="space-y-3">
                  {data.qr_instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                        {index + 1}
                      </span>
                      <p className="pt-0.5 text-sm text-neutral-700">
                        {instruction}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </motion.div>

          {/* Right Column - QR Code */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 text-center text-lg font-bold text-neutral-800">
              Scan QR Code
            </h2>
            <div className="flex items-center justify-center">
              <div className="rounded-lg border-4 border-neutral-100 bg-white p-6">
                <QRCodeComponent value={bookingUrl} size={256} level="H" />
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-neutral-500">
              Scan to book this room directly
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
