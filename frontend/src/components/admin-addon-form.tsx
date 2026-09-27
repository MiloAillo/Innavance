import { useState } from "react";
import { Loader2 } from "lucide-react";

interface AddonFormData {
  addon: string;
  price: number;
  borrowMaximum: number;
  totalStock: number;
}

interface AdminAddonFormProps {
  initialData?: AddonFormData & { currentlyBorrowed?: number };
  onSubmit: (data: AddonFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
}

export function AdminAddonForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  mode,
}: AdminAddonFormProps) {
  const [formData, setFormData] = useState<AddonFormData>({
    addon: initialData?.addon || "",
    price: initialData?.price || 0,
    borrowMaximum: initialData?.borrowMaximum || 1,
    totalStock: initialData?.totalStock || 10,
  });

  const [priceDisplay, setPriceDisplay] = useState<string>(
    initialData?.price ? formatToRupiah(initialData.price) : ""
  );
  const [totalStockDisplay, setTotalStockDisplay] = useState<string>(
    initialData?.totalStock ? initialData.totalStock.toString() : ""
  );

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

    if (!formData.addon.trim()) newErrors.addon = "Addon name is required";
    if (formData.addon.length > 50)
      newErrors.addon = "Addon name must be less than 50 characters";

    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";

    if (formData.borrowMaximum < 1)
      newErrors.borrowMaximum = "Borrow maximum must be at least 1";

    if (formData.totalStock < 1)
      newErrors.totalStock = "Total stock must be at least 1";

    if (
      mode === "edit" &&
      initialData?.currentlyBorrowed !== undefined &&
      formData.totalStock < initialData.currentlyBorrowed
    ) {
      newErrors.totalStock = `Cannot set stock below currently borrowed amount (${initialData.currentlyBorrowed})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit(formData);
  };

  const updateField = (field: keyof AddonFormData, value: any) => {
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

  const handleTotalStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setTotalStockDisplay(value);
      updateField("totalStock", value === "" ? 0 : parseInt(value, 10));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section>
        <h3 className="mb-4 text-lg font-bold text-neutral-800">
          Addon Information
        </h3>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Addon Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.addon}
              onChange={(e) => updateField("addon", e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
              placeholder="e.g., Extra Bed"
            />
            {errors.addon && (
              <p className="mt-1 text-xs text-red-600">{errors.addon}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-neutral-700">
                Price <span className="text-red-500">*</span>
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
                  placeholder="50.000"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-700">
                Borrow Maximum <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.borrowMaximum}
                onChange={(e) =>
                  updateField("borrowMaximum", parseInt(e.target.value) || 1)
                }
                min={1}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                disabled={isSubmitting}
              />
              {errors.borrowMaximum && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.borrowMaximum}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Total Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={totalStockDisplay}
              onChange={handleTotalStockChange}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              disabled={isSubmitting}
              placeholder="10"
            />
            {mode === "edit" && initialData?.currentlyBorrowed !== undefined && (
              <p className="mt-1 text-xs text-neutral-500">
                Currently Borrowed: {initialData.currentlyBorrowed} /{" "}
                {formData.totalStock}
              </p>
            )}
            {errors.totalStock && (
              <p className="mt-1 text-xs text-red-600">{errors.totalStock}</p>
            )}
          </div>
        </div>
      </section>

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
          {isSubmitting && <Loader2 className="animate-spin" size={18} />}
          {mode === "create" ? "Create Addon" : "Update Addon"}
        </button>
      </div>
    </form>
  );
}
