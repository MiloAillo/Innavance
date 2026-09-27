import type { AdminAddon } from "../types/admin-dashboard.type";

interface AdminAddonPickerProps {
  addons: AdminAddon[];
  selectedAddonIds: number[];
  onChange: (addonIds: number[]) => void;
  disabled?: boolean;
}

export function AdminAddonPicker({
  addons,
  selectedAddonIds,
  onChange,
  disabled = false,
}: AdminAddonPickerProps) {
  const activeAddons = addons.filter((addon) => addon.isActive);

  const handleToggle = (addonId: number) => {
    if (disabled) return;
    
    if (selectedAddonIds.includes(addonId)) {
      onChange(selectedAddonIds.filter((id) => id !== addonId));
    } else {
      onChange([...selectedAddonIds, addonId]);
    }
  };

  if (activeAddons.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-neutral-500">
        No active addons available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="max-h-60 overflow-y-auto rounded-lg border border-neutral-200 bg-white">
        {activeAddons.map((addon) => {
          const isSelected = selectedAddonIds.includes(addon.id);
          const availableStock = addon.totalStock - addon.currentlyBorrowed;

          return (
            <label
              key={addon.id}
              className={`flex items-center gap-3 border-b border-neutral-100 p-3 last:border-b-0 cursor-pointer hover:bg-neutral-50 transition-colors ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(addon.id)}
                disabled={disabled}
                className="h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">
                    {addon.addon}
                  </span>
                  <span className="text-sm text-neutral-600">
                    Rp {addon.price.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                  <span>Max: {addon.borrowMaximum}</span>
                  <span>•</span>
                  <span
                    className={
                      availableStock === 0
                        ? "text-red-600 font-semibold"
                        : availableStock <= 3
                        ? "text-orange-600 font-semibold"
                        : ""
                    }
                  >
                    Stock: {availableStock}/{addon.totalStock}
                  </span>
                </div>
              </div>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-neutral-500">
        {selectedAddonIds.length} addon{selectedAddonIds.length !== 1 ? "s" : ""} selected
      </p>
    </div>
  );
}
