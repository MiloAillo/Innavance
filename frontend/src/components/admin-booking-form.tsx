import { useState } from "react";
import type { AdminRoom } from "../types/admin-dashboard.type";
import { FileUploadField } from "./file-upload-field";
import { Loader2, Plus, Minus, Wallet } from "lucide-react";

interface BookingFormData {
  full_name: string;
  phone_number: string;
  nik: string;
  birth_date: string;
  sex: "MALE" | "FEMALE";
  home_address: string;
  profession: string;
  workplace_school: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  emergency_contact_relation: string;
  duration: number;
  payment_method: string;
  addons: { id: number; count: number }[];
}

interface AdminBookingFormProps {
  room: AdminRoom;
  onSubmit: (data: BookingFormData, file: File) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function AdminBookingForm({
  room,
  onSubmit,
  onCancel,
  isSubmitting,
}: AdminBookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    full_name: "",
    phone_number: "",
    nik: "",
    birth_date: "",
    sex: "MALE",
    home_address: "",
    profession: "",
    workplace_school: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    emergency_contact_relation: "",
    duration: 1,
    payment_method: "Cash",
    addons: [],
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim())
      newErrors.full_name = "Full name is required";
    if (formData.full_name.length > 100)
      newErrors.full_name = "Full name must be less than 100 characters";

    const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
    if (!formData.phone_number.trim())
      newErrors.phone_number = "Phone number is required";
    else if (!phoneRegex.test(formData.phone_number))
      newErrors.phone_number = "Invalid Indonesian phone number";

    if (!formData.nik.trim()) newErrors.nik = "NIK is required";
    else if (!/^\d{16}$/.test(formData.nik))
      newErrors.nik = "NIK must be exactly 16 digits";

    if (!formData.birth_date) newErrors.birth_date = "Birth date is required";

    if (!formData.home_address.trim())
      newErrors.home_address = "Home address is required";

    if (!formData.emergency_contact_name.trim())
      newErrors.emergency_contact_name = "Emergency contact name is required";

    if (!formData.emergency_contact_number.trim())
      newErrors.emergency_contact_number = "Emergency contact number is required";
    else if (!phoneRegex.test(formData.emergency_contact_number))
      newErrors.emergency_contact_number = "Invalid Indonesian phone number";

    if (!formData.emergency_contact_relation.trim())
      newErrors.emergency_contact_relation = "Relationship is required";

    if (formData.duration < 1)
      newErrors.duration = "Duration must be at least 1 day";

    if (!uploadedFile) newErrors.id_card_photo = "ID card photo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !uploadedFile) return;

    await onSubmit(formData, uploadedFile);
  };

  const updateField = (field: keyof BookingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getAvailableAddons = () => {
    if (!room.roomsAddons) return [];
    return room.roomsAddons
      .filter((ra) => ra.addon.isActive)
      .map((ra) => ra.addon);
  };

  const getAddonQuantity = (addonId: number) => {
    const addon = formData.addons.find((a) => a.id === addonId);
    return addon ? addon.count : 0;
  };

  const updateAddonQuantity = (addonId: number, count: number) => {
    const addon = getAvailableAddons().find((a) => a.id === addonId);
    if (!addon) return;

    const availableStock = addon.totalStock - addon.currentlyBorrowed;
    const maxCount = Math.min(addon.borrowMaximum, availableStock);
    const clampedCount = Math.max(0, Math.min(count, maxCount));

    setFormData((prev) => {
      const existingIndex = prev.addons.findIndex((a) => a.id === addonId);
      if (clampedCount === 0) {
        return {
          ...prev,
          addons: prev.addons.filter((a) => a.id !== addonId),
        };
      }
      if (existingIndex >= 0) {
        const newAddons = [...prev.addons];
        newAddons[existingIndex] = { id: addonId, count: clampedCount };
        return { ...prev, addons: newAddons };
      }
      return {
        ...prev,
        addons: [...prev.addons, { id: addonId, count: clampedCount }],
      };
    });
  };

  const calculateTotal = () => {
    let total = room.price * formData.duration;
    const availableAddons = getAvailableAddons();
    formData.addons.forEach((selectedAddon) => {
      const addon = availableAddons.find((a) => a.id === selectedAddon.id);
      if (addon) {
        total += addon.price * selectedAddon.count;
      }
    });
    return total;
  };

  const getAddonSubtotal = (addonId: number) => {
    const addon = getAvailableAddons().find((a) => a.id === addonId);
    const quantity = getAddonQuantity(addonId);
    if (!addon || quantity === 0) return 0;
    return addon.price * quantity;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Personal Information Section */}
      <section>
        <h3 className="mb-4 text-lg font-bold text-neutral-800">
          Personal Information
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                updateField("phone_number", e.target.value.replace(/\D/g, ""))
              }
              placeholder="+62 or 08xx"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
            />
            {errors.phone_number && (
              <p className="mt-1 text-xs text-red-600">{errors.phone_number}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700">
              NIK (16 digits) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nik}
              onChange={(e) =>
                updateField("nik", e.target.value.replace(/\D/g, "").slice(0, 16))
              }
              maxLength={16}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
            />
            {errors.nik && (
              <p className="mt-1 text-xs text-red-600">{errors.nik}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Birth Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => updateField("birth_date", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
            />
            {errors.birth_date && (
              <p className="mt-1 text-xs text-red-600">{errors.birth_date}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Sex <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sex"
                  value="MALE"
                  checked={formData.sex === "MALE"}
                  onChange={(e) => updateField("sex", e.target.value as "MALE" | "FEMALE")}
                  className="h-4 w-4 accent-green-600"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-neutral-700">Male</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sex"
                  value="FEMALE"
                  checked={formData.sex === "FEMALE"}
                  onChange={(e) => updateField("sex", e.target.value as "MALE" | "FEMALE")}
                  className="h-4 w-4 accent-green-600"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-neutral-700">Female</span>
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-neutral-700">
              Home Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.home_address}
              onChange={(e) => updateField("home_address", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
            />
            {errors.home_address && (
              <p className="mt-1 text-xs text-red-600">{errors.home_address}</p>
            )}
          </div>
        </div>
      </section>

      {/* Professional Information Section */}
      <section>
        <h3 className="mb-4 text-lg font-bold text-neutral-800">
          Professional Information (Optional)
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Profession
            </label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => updateField("profession", e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Workplace / School
            </label>
            <input
              type="text"
              value={formData.workplace_school}
              onChange={(e) => updateField("workplace_school", e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section>
        <h3 className="mb-4 text-lg font-bold text-neutral-800">
          Emergency Contact
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.emergency_contact_name}
              onChange={(e) =>
                updateField("emergency_contact_name", e.target.value)
              }
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
            />
            {errors.emergency_contact_name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.emergency_contact_name}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.emergency_contact_number}
              onChange={(e) =>
                updateField(
                  "emergency_contact_number",
                  e.target.value.replace(/\D/g, "")
                )
              }
              placeholder="+62 or 08xx"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
            />
            {errors.emergency_contact_number && (
              <p className="mt-1 text-xs text-red-600">
                {errors.emergency_contact_number}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Relationship <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.emergency_contact_relation}
              onChange={(e) =>
                updateField("emergency_contact_relation", e.target.value)
              }
              placeholder="e.g., Parent, Sibling, Spouse"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
            />
            {errors.emergency_contact_relation && (
              <p className="mt-1 text-xs text-red-600">
                {errors.emergency_contact_relation}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ID Card Upload Section */}
      <section>
        <h3 className="mb-4 text-lg font-bold text-neutral-800">
          Identity Verification
        </h3>
        <FileUploadField
          label="ID Card Photo"
          required
          value={uploadedFile}
          onChange={setUploadedFile}
          error={errors.id_card_photo}
          maxSizeMB={5}
        />
      </section>

      {/* Booking Details Section */}
      <section>
        <h3 className="mb-4 text-lg font-bold text-neutral-800">
          Booking Details
        </h3>
        
        <div className="mb-4 rounded-lg bg-neutral-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-700">Room</p>
              <p className="text-lg font-bold text-neutral-900">{room.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-600">Price per day</p>
              <p className="text-lg font-bold text-green-600">
                Rp {room.price.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Duration (days) <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  updateField("duration", Math.max(1, formData.duration - 1))
                }
                disabled={isSubmitting || formData.duration <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50"
              >
                <Minus size={18} />
              </button>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  updateField("duration", Math.max(1, Number(e.target.value)))
                }
                min={1}
                className="w-20 rounded-md border border-neutral-300 px-3 py-2 text-center text-lg font-bold focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => updateField("duration", formData.duration + 1)}
                disabled={isSubmitting}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  updateField("duration", Math.max(1, formData.duration - 30))
                }
                disabled={isSubmitting || formData.duration <= 30}
                className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -1 Month
              </button>
              <button
                type="button"
                onClick={() =>
                  updateField("duration", Math.max(1, formData.duration - 7))
                }
                disabled={isSubmitting || formData.duration <= 7}
                className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -1 Week
              </button>
              <button
                type="button"
                onClick={() =>
                  updateField("duration", formData.duration + 7)
                }
                disabled={isSubmitting}
                className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs hover:bg-neutral-50"
              >
                +1 Week
              </button>
              <button
                type="button"
                onClick={() =>
                  updateField("duration", formData.duration + 30)
                }
                disabled={isSubmitting}
                className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs hover:bg-neutral-50"
              >
                +1 Month
              </button>
            </div>
            {errors.duration && (
              <p className="mt-1 text-xs text-red-600">{errors.duration}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
              <Wallet size={16} className="text-neutral-600" />
              <span className="text-sm font-medium text-neutral-800">Cash</span>
              <span className="ml-auto text-xs text-neutral-500">(Only option)</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border-2 border-green-500 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-green-800">Total Price</p>
            <p className="text-2xl font-bold text-green-600">
              Rp {calculateTotal().toLocaleString("id-ID")}
            </p>
          </div>
          <p className="mt-1 text-xs text-green-700">
            {formData.duration} day(s) × Rp {room.price.toLocaleString("id-ID")}
            {formData.addons.length > 0 && " + addons"}
          </p>
        </div>
      </section>

      {/* Addons Section */}
      {getAvailableAddons().length > 0 && (
        <section>
          <h3 className="mb-4 text-lg font-bold text-neutral-800">
            Additional Items (Optional)
          </h3>
          <div className="space-y-3">
            {getAvailableAddons().map((addon) => {
              const quantity = getAddonQuantity(addon.id);
              const availableStock = addon.totalStock - addon.currentlyBorrowed;
              const isOutOfStock = availableStock === 0;
              const isLowStock = availableStock > 0 && availableStock <= 3;
              const subtotal = getAddonSubtotal(addon.id);

              return (
                <div
                  key={addon.id}
                  className={`rounded-lg border p-4 ${
                    isOutOfStock
                      ? "border-red-200 bg-red-50"
                      : isLowStock
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-neutral-900">
                          {addon.addon}
                        </p>
                        {isOutOfStock && (
                          <span className="rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                            Out of Stock
                          </span>
                        )}
                        {isLowStock && (
                          <span className="rounded bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-neutral-600">
                        Rp {addon.price.toLocaleString("id-ID")} / item
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Available: {availableStock} | Max per booking:{" "}
                        {addon.borrowMaximum}
                      </p>
                      {subtotal > 0 && (
                        <p className="mt-2 text-sm font-semibold text-green-600">
                          Subtotal: Rp {subtotal.toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateAddonQuantity(addon.id, quantity - 1)
                        }
                        disabled={isSubmitting || quantity === 0 || isOutOfStock}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-semibold text-neutral-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateAddonQuantity(addon.id, quantity + 1)
                        }
                        disabled={
                          isSubmitting ||
                          isOutOfStock ||
                          quantity >= Math.min(addon.borrowMaximum, availableStock)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 border-t border-neutral-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-neutral-200 px-4 py-2.5 font-semibold text-neutral-800 hover:bg-neutral-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 font-semibold text-white hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Creating Booking...
            </>
          ) : (
            "Create Booking"
          )}
        </button>
      </div>
    </form>
  );
}
