import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import { AdminRoomForm } from "./admin-room-form";
import type { AdminAddon } from "../types/admin-dashboard.type";

interface RoomFormData {
  name: string;
  price: number;
  capacity: number;
  description: string;
  addonIds: number[];
}

interface AdminRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoomFormData) => Promise<void>;
  mode: "create" | "edit";
  initialData?: RoomFormData;
  addons: AdminAddon[];
}

export function AdminRoomModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  addons,
}: AdminRoomModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (data: RoomFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {showSuccess ? (
                <div className="flex flex-col items-center justify-center gap-4 p-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    <CheckCircle size={64} className="text-green-500" />
                  </motion.div>
                  <p className="text-xl font-bold text-neutral-800">
                    {mode === "create"
                      ? "Room Created Successfully!"
                      : "Room Updated Successfully!"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-neutral-200 p-6">
                    <h2 className="text-xl font-bold text-neutral-800">
                      {mode === "create" ? "Create New Room" : "Edit Room"}
                    </h2>
                    <button
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="rounded-full p-1 hover:bg-neutral-100 disabled:opacity-50"
                    >
                      <X size={24} className="text-neutral-600" />
                    </button>
                  </div>
                  <div className="p-6">
                    <AdminRoomForm
                      initialData={initialData}
                      onSubmit={handleSubmit}
                      onCancel={handleClose}
                      isSubmitting={isSubmitting}
                      mode={mode}
                      addons={addons}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
