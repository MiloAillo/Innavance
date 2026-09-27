import { AnimatePresence, motion } from "framer-motion";
import { X, User, Phone, MapPin, Briefcase, Heart, Calendar, IdCard } from "lucide-react";
import type { AdminBooking } from "../types/admin-dashboard.type";
import { useEffect, useState } from "react";
import { adminApi } from "../API/admin-api";

interface GuestDetailsModalProps {
  booking: AdminBooking;
  isOpen: boolean;
  onClose: () => void;
}

export function GuestDetailsModal({
  booking,
  isOpen,
  onClose,
}: GuestDetailsModalProps) {
  const [decryptedNIK, setDecryptedNIK] = useState<string>("[Loading...]");
  const [isLoadingNIK, setIsLoadingNIK] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingNIK(true);
      adminApi
        .get<{ nik: string }>(`/admins/dashboard/bookings/${booking.id}/decrypt-nik`)
        .then((res) => setDecryptedNIK(res.data.nik))
        .catch(() => setDecryptedNIK("[Decryption Failed]"))
        .finally(() => setIsLoadingNIK(false));
    }
  }, [isOpen, booking.id]);

  const age = calculateAge(booking.birthDate);
  const formattedBirthDate = new Date(booking.birthDate).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const checkinDate = new Date(booking.createdAt);
  const checkoutDate = new Date(checkinDate.getTime() + booking.duration * 24 * 60 * 60 * 1000);
  const formattedCheckin = checkinDate.toLocaleDateString("id-ID", { 
    year: "numeric",
    month: "long", 
    day: "numeric" 
  });
  const formattedCheckout = checkoutDate.toLocaleDateString("id-ID", { 
    year: "numeric",
    month: "long", 
    day: "numeric" 
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-200 p-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Guest Information
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {booking.fullName} · {booking.bookingRoom?.name}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
                <div className="flex flex-col gap-6">
                  
                  {/* Booking Summary */}
                  <section className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-green-700">
                      Booking Summary
                    </h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Room:</span>
                        <span className="font-semibold text-neutral-800">
                          {booking.bookingRoom?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Check-in:</span>
                        <span className="font-semibold text-neutral-800">
                          {formattedCheckin}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Check-out:</span>
                        <span className="font-semibold text-neutral-800">
                          {formattedCheckout}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Duration:</span>
                        <span className="font-semibold text-neutral-800">
                          {booking.duration} days
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                        <span className="text-neutral-600">Total Price:</span>
                        <span className="text-lg font-bold text-green-600">
                          Rp {booking.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Payment:</span>
                        <span className="font-semibold text-neutral-800">
                          {booking.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Personal Information */}
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-700">
                      <User size={16} />
                      Personal Information
                    </h3>
                    <div className="grid gap-3 text-sm">
                      <InfoRow icon={<User size={16} />} label="Full Name" value={booking.fullName} />
                      <InfoRow icon={<Phone size={16} />} label="Phone Number" value={booking.phoneNumber} />
                      <InfoRow 
                        icon={<IdCard size={16} />} 
                        label="NIK" 
                        value={isLoadingNIK ? "Loading..." : decryptedNIK} 
                      />
                      <InfoRow icon={<Calendar size={16} />} label="Birth Date" value={`${formattedBirthDate} (${age} years old)`} />
                      <InfoRow icon={<User size={16} />} label="Sex" value={booking.sex === "MALE" ? "Male" : "Female"} />
                      <InfoRow icon={<MapPin size={16} />} label="Home Address" value={booking.homeAddress} />
                    </div>
                  </section>

                  {/* Professional Information (if available) */}
                  {(booking.profession || booking.workplaceSchool) && (
                    <section>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-700">
                        <Briefcase size={16} />
                        Professional Information
                      </h3>
                      <div className="grid gap-3 text-sm">
                        {booking.profession && (
                          <InfoRow icon={<Briefcase size={16} />} label="Profession" value={booking.profession} />
                        )}
                        {booking.workplaceSchool && (
                          <InfoRow icon={<Briefcase size={16} />} label="Workplace/School" value={booking.workplaceSchool} />
                        )}
                      </div>
                    </section>
                  )}

                  {/* Emergency Contact */}
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-700">
                      <Heart size={16} />
                      Emergency Contact
                    </h3>
                    <div className="grid gap-3 text-sm">
                      <InfoRow icon={<User size={16} />} label="Name" value={booking.emergencyContactName} />
                      <InfoRow icon={<Phone size={16} />} label="Phone" value={booking.emergencyContactNumber} />
                      <InfoRow icon={<Heart size={16} />} label="Relation" value={booking.emergencyContactRelation} />
                    </div>
                  </section>

                  {/* ID Card Photo */}
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-700">
                      <IdCard size={16} />
                      ID Card Photo
                    </h3>
                    <div className="rounded-lg border border-neutral-200 overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${booking.idCardPhotoPath}`}
                        alt="ID Card"
                        className="w-full h-auto"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const placeholder = document.createElement("div");
                          placeholder.className = "flex flex-col items-center justify-center bg-neutral-50 p-12 text-neutral-400";
                          placeholder.innerHTML = `
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <p class="mt-3 text-sm font-medium">No Image Available</p>
                          `;
                          target.parentElement?.appendChild(placeholder);
                        }}
                      />
                    </div>
                  </section>

                  {/* Addons */}
                  {booking.bookingsAddons.length > 0 && (
                    <section>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-700">
                        Room Addons
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {booking.bookingsAddons.map((addon, idx) => (
                          <span
                            key={idx}
                            className="rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700"
                          >
                            {addon.addonAddon.addon} ×{addon.count}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-200 p-4">
                <button
                  onClick={onClose}
                  className="w-full rounded-lg bg-neutral-800 px-4 py-2.5 font-semibold text-white hover:bg-neutral-900"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <div className="text-neutral-600 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-neutral-600">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-neutral-800">{value}</p>
      </div>
    </div>
  );
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
