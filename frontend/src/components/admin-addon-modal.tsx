import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AdminAddonForm } from "./admin-addon-form";
import { motion, AnimatePresence } from "framer-motion";

interface AdminAddonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    addon: string;
    price: number;
    borrowMaximum: number;
    totalStock: number;
  }) => Promise<void>;
  initialData?: {
    addon: string;
    price: number;
    borrowMaximum: number;
    totalStock: number;
    currentlyBorrowed?: number;
  };
  mode: "create" | "edit";
}

export function AdminAddonModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: AdminAddonModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (data: {
    addon: string;
    price: number;
    borrowMaximum: number;
    totalStock: number;
  }) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-800">
                {mode === "create" ? "Addon Created!" : "Addon Updated!"}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Changes saved successfully
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">
                  {mode === "create" ? "Add Addon" : "Edit Addon"}
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-full p-2 hover:bg-neutral-100 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
              <AdminAddonForm
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                isSubmitting={isSubmitting}
                mode={mode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
