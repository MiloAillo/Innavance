import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import { useState } from "react";
import type { AdminRoom } from "../types/admin-dashboard.type";
import { AdminBookingForm } from "./admin-booking-form";
import { adminApi } from "../API/admin-api";

interface AdminBookingModalProps {
  room: AdminRoom | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingId: number, guestName: string) => void;
}

export function AdminBookingModal({
  room,
  isOpen,
  onClose,
  onSuccess,
}: AdminBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    guestName: string;
    bookingId: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any, file: File) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Upload ID card photo
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await adminApi.post<{ path: string }>(
        "/bookings/upload-id-card",
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const idCardPath = uploadResponse.data.path;

      // Step 2: Create booking with all data
      const bookingPayload = {
        room_id: room!.id,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        nik: formData.nik,
        id_card_photo_path: idCardPath,
        birth_date: formData.birth_date,
        sex: formData.sex,
        home_address: formData.home_address,
        profession: formData.profession || undefined,
        workplace_school: formData.workplace_school || undefined,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_number: formData.emergency_contact_number,
        emergency_contact_relation: formData.emergency_contact_relation,
        duration: formData.duration,
        payment_method: formData.payment_method,
        addons: formData.addons,
      };

      const bookingResponse = await adminApi.post<{ booking_id: number }>(
        "/bookings",
        bookingPayload
      );

      // Success!
      setSuccessData({
        guestName: formData.full_name,
        bookingId: bookingResponse.data.booking_id,
      });
      setShowSuccess(true);

      // Auto-navigate after 1.5 seconds
      setTimeout(() => {
        onSuccess(bookingResponse.data.booking_id, formData.full_name);
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create booking"
      );
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setShowSuccess(false);
    setSuccessData(null);
    setError(null);
    setIsSubmitting(false); // Reset submitting state
    onClose();
  };

  if (!room) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl my-8 rounded-xl bg-white shadow-2xl"
            >
              {!showSuccess ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-neutral-200 p-6">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-800">
                        Create Booking
                      </h2>
                      <p className="text-sm text-neutral-500">
                        Fill in guest information for {room.name}
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600 disabled:opacity-50"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-semibold text-red-700">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Form Content */}
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
                    <AdminBookingForm
                      room={room}
                      onSubmit={handleSubmit}
                      onCancel={handleClose}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                </>
              ) : (
                /* Success State */
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
                  >
                    <CheckCircle className="text-green-600" size={48} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-neutral-800">
                    Booking Created Successfully!
                  </h3>
                  <p className="mt-2 text-neutral-600">
                    Booking for <span className="font-semibold">{successData?.guestName}</span> has been created.
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Redirecting to approval queue...
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
