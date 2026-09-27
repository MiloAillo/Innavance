import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { AdminAddonPicker } from "./admin-addon-picker";
import type { AdminAddon } from "../types/admin-dashboard.type";

interface RoomFormData {
  name: string;
  price: number;
  capacity: number;
  features: string[];
  addonIds: number[];
}

interface AdminRoomFormProps {
  initialData?: RoomFormData;
  onSubmit: (data: RoomFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
  addons: AdminAddon[];
  errorMessage?: string | null;
  onErrorDismiss?: () => void;
}

export function AdminRoomForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  mode,
  addons,
  errorMessage,
  onErrorDismiss,
}: AdminRoomFormProps) {
  const [formData, setFormData] = useState<RoomFormData>(
    initialData || {
      name: "",
      price: 0,
      capacity: 1,
      features: [],
      addonIds: [],
    }
  );

  const [priceDisplay, setPriceDisplay] = useState<string>(
    initialData?.price ? formatToRupiah(initialData.price) : ""
  );
  const [capacityDisplay, setCapacityDisplay] = useState<string>(
    initialData?.capacity ? initialData.capacity.toString() : ""
  );
  const [featureInput, setFeatureInput] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  function formatToRupiah(value: number): string {
    return new Intl.NumberFormat("id-ID").format(value);
  }

  function parseFromRupiah(value: string): number {
    const cleaned = value.replace(/\D/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Room name is required";
    if (formData.name.length > 225)
      newErrors.name = "Room name must be less than 225 characters";

    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";

    if (formData.capacity < 1)
      newErrors.capacity = "Capacity must be at least 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit(formData);
  };

  const updateField = (field: keyof RoomFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFromRupiah(value);
    setPriceDisplay(value.replace(/\D/g, "") ? formatToRupiah(numericValue) : "");
    updateField("price", numericValue);
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCapacityDisplay(value);
      updateField("capacity", value === "" ? 0 : parseInt(value, 10));
    }
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) {
      setErrors((prev) => ({ ...prev, features: "Feature must be less than 500 characters" }));
      return;
    }
    if (formData.features.includes(trimmed)) {
      setErrors((prev) => ({ ...prev, features: "Feature already added" }));
      return;
    }
    
    updateField("features", [...formData.features, trimmed]);
    setFeatureInput("");
    if (errors.features) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.features;
        return newErrors;
      });
    }
  };

  const removeFeature = (index: number) => {
    updateField("features", formData.features.filter((_, i) => i !== index));
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section>
        <h3 className="mb-4 text-lg font-bold text-neutral-800">
          Room Information
        </h3>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Room Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
              placeholder="e.g., VIP Space"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-neutral-700">
                Price (per day) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                  Rp
                </span>
                <input
                  type="text"
                  value={priceDisplay}
                  onChange={handlePriceChange}
                  className="w-full rounded-md border border-neutral-300 pl-10 pr-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  disabled={isSubmitting}
                  placeholder="100.000"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-700">
                Capacity (people) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={capacityDisplay}
                onChange={handleCapacityChange}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                disabled={isSubmitting}
                placeholder="2"
              />
              {errors.capacity && (
                <p className="mt-1 text-xs text-red-600">{errors.capacity}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Features (Optional)
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={handleFeatureKeyDown}
                className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                disabled={isSubmitting}
                placeholder="e.g., WiFi, AC, Private Bath"
                maxLength={500}
              />
              <button
                type="button"
                onClick={addFeature}
                disabled={isSubmitting || !featureInput.trim()}
                className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {errors.features && (
              <p className="mt-1 text-xs text-red-600">{errors.features}</p>
            )}
            
            {formData.features.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      disabled={isSubmitting}
                      className="ml-1 hover:text-green-900 disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-bold text-neutral-800">
          Available Addons
        </h3>
        <p className="mb-3 text-sm text-neutral-600">
          Select which addons guests can choose when booking this room
        </p>
        <AdminAddonPicker
          addons={addons}
          selectedAddonIds={formData.addonIds}
          onChange={(addonIds) => updateField("addonIds", addonIds)}
          disabled={isSubmitting}
        />
      </section>

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
          {onErrorDismiss && (
            <button
              onClick={onErrorDismiss}
              className="text-red-400 hover:text-red-600"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

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
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : mode === "create" ? (
            "Create Room"
          ) : (
            "Update Room"
          )}
        </button>
      </div>
    </form>
  );
}
