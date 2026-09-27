import { motion } from "framer-motion";
import { Package, MoreVertical } from "lucide-react";
import type { AdminAddon } from "../types/admin-dashboard.type";
import { useState } from "react";

interface AddonCardProps {
  addon: AdminAddon;
  onEdit?: (addon: AdminAddon) => void;
  onDeactivate?: (addonId: number) => void;
  onReactivate?: (addonId: number) => void;
  isManager?: boolean;
}

export function AddonCard({
  addon,
  onEdit,
  onDeactivate,
  onReactivate,
  isManager,
}: AddonCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const availableStock = addon.totalStock - addon.currentlyBorrowed;
  const isLowStock = availableStock <= 3 && availableStock > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col justify-between relative"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Package size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-800">{addon.addon}</p>
              <p className="mt-1 text-sm text-neutral-500">
                Rp {addon.price.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                addon.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {addon.isActive ? "Active" : "Inactive"}
            </span>
            {isManager && (onEdit || onDeactivate || onReactivate) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded-full p-1 hover:bg-neutral-100 transition-colors"
                >
                  <MoreVertical size={18} className="text-neutral-600" />
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-neutral-200 bg-white shadow-lg overflow-hidden">
                      {onEdit && (
                        <button
                          onClick={() => {
                            onEdit(addon);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      {addon.isActive && onDeactivate && (
                        <button
                          onClick={() => {
                            onDeactivate(addon.id);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                          Deactivate
                        </button>
                      )}
                      {!addon.isActive && onReactivate && (
                        <button
                          onClick={() => {
                            onReactivate(addon.id);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Borrow Maximum:</span>
            <span className="font-semibold text-neutral-800">
              {addon.borrowMaximum}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Stock:</span>
            <span
              className={`font-semibold ${
                availableStock === 0
                  ? "text-red-600"
                  : isLowStock
                  ? "text-orange-600"
                  : "text-neutral-800"
              }`}
            >
              {availableStock} / {addon.totalStock}
              {availableStock === 0 && " (Out of Stock)"}
              {isLowStock && " (Low Stock)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Currently Borrowed:</span>
            <span className="font-semibold text-neutral-800">
              {addon.currentlyBorrowed}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
