import { useEffect, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Loader2,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  approveBooking,
  createStaff,
  deleteStaff,
  rejectBooking,
  dismissInnkeeperCall,
  forceCheckout,
  getAdminBookings,
  getAdminRooms,
  getAdminSettings,
  getAdminUserInfo,
  getAdminUsers,
  markAddonServed,
  updateBookingSettings,
  updateStaffPermissions,
} from "../../API/admin-api";
import type {
  AdminBookingsResponse,
  AdminRoomsResponse,
  AdminSettings as AdminSettingsType,
  AdminUserInfo,
  AdminUsersResponse,
} from "../../types/admin-dashboard.type";
import { AdminSidebar, type AdminView } from "../../components/admin-sidebar";
import { BookingCard } from "../../components/admin-booking-card";
import { RoomCard } from "../../components/admin-room-card";
import { useViewPolling } from "../../hooks/useViewPolling";

interface PaginationProps {
  page: number;
  pageEnd: number;
  hasBefore: boolean;
  hasAfter: boolean;
  onPageChange: (page: number) => void;
}

function Pagination({
  page,
  pageEnd,
  hasBefore,
  hasAfter,
  onPageChange,
}: PaginationProps): JSX.Element {
  return (
    <div className="flex justify-end items-center gap-2">
      <button
        disabled={!hasBefore}
        onClick={() => onPageChange(page - 1)}
        className="flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft size={16} /> Prev
      </button>
      <span className="text-sm font-medium text-neutral-500">
        Page {page} / {pageEnd}
      </span>
      <button
        disabled={!hasAfter}
        onClick={() => onPageChange(page + 1)}
        className="flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}

export function AdminDashboard(): JSX.Element {
  const [view, setView] = useState<AdminView>("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<AdminUserInfo | null>(null);
  const [settings, setSettings] = useState<AdminSettingsType | null>(null);
  const [users, setUsers] = useState<AdminUsersResponse | null>(null);
  const [rooms, setRooms] = useState<AdminRoomsResponse | null>(null);
  const [approvals, setApprovals] = useState<AdminBookingsResponse | null>(
    null,
  );
  const [attention, setAttention] = useState<AdminBookingsResponse | null>(
    null,
  );
  const [activeBookings, setActiveBookings] =
    useState<AdminBookingsResponse | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [activeSort, setActiveSort] = useState("updatedAt");
  const [activeOrder, setActiveOrder] = useState<"asc" | "desc">("desc");
  const [approvalPage, setApprovalPage] = useState(1);
  const [approvalSort, setApprovalSort] = useState("createdAt");
  const [approvalOrder, setApprovalOrder] = useState<"asc" | "desc">("asc");

  const [attentionPage, setAttentionPage] = useState(1);
  const [attentionSort, setAttentionSort] = useState("updatedAt");
  const [attentionOrder, setAttentionOrder] = useState<"asc" | "desc">("desc");

  const [roomsPage, setRoomsPage] = useState(1);
  const [roomsSort, setRoomsSort] = useState("name");
  const [roomsOrder, setRoomsOrder] = useState<"asc" | "desc">("asc");
  const [roomsAvailable, setRoomsAvailable] = useState<
    "true" | "false" | "both"
  >("both");
  const [roomsSearch, setRoomsSearch] = useState("");

  const [historyBookings, setHistoryBookings] =
    useState<AdminBookingsResponse | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySort, setHistorySort] = useState("createdAt");
  const [historyOrder, setHistoryOrder] = useState<"asc" | "desc">("desc");
  const [historySearch, setHistorySearch] = useState("");

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [staffFormError, setStaffFormError] = useState<string | null>(null);
  const [staffFormLoading, setStaffFormLoading] = useState(false);
  const [deleteStaffId, setDeleteStaffId] = useState<number | null>(null);
  const [deleteStaffLoading, setDeleteStaffLoading] = useState(false);
  const [deleteStaffError, setDeleteStaffError] = useState<string | null>(null);

  const [dismissBookingId, setDismissBookingId] = useState<number | null>(null);
  const [dismissMessage, setDismissMessage] = useState("");
  const [checkoutBookingId, setCheckoutBookingId] = useState<number | null>(
    null,
  );
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [allowGracePeriod, setAllowGracePeriod] = useState(true);
  const [rejectBookingId, setRejectBookingId] = useState<number | null>(null);

  const [settingsForm, setSettingsForm] = useState({
    is_auto_approve: false,
    auto_approve_time: 0,
    checkout_grace_period: 0,
    smart_door_default_pin: "",
    qr_instructions: [] as string[],
  });
  const [qrInstructionsWithIds, setQrInstructionsWithIds] = useState<
    { id: string; text: string }[]
  >([]);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [staffPermissionsForm, setStaffPermissionsForm] = useState({
    is_staff_allowed_to_approve: false,
    is_staff_allowed_to_force_checkout: false,
    is_staff_allowed_to_dissmiss_call: false,
  });
  const [staffPermissionsSaving, setStaffPermissionsSaving] = useState(false);
  const [staffPermissionsError, setStaffPermissionsError] = useState<
    string | null
  >(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [servingAddonId, setServingAddonId] = useState<number | null>(null);
  const [dismissingId, setDismissingId] = useState<number | null>(null);
  const [forcingCheckoutId, setForcingCheckoutId] = useState<number | null>(null);

  const isManager = userInfo?.type === "manager";
  const canApprove =
    isManager || rooms?.meta.is_staff_allowed_to_approve === true;
  const canDismiss =
    isManager || rooms?.meta.is_staff_allowed_to_dismiss_call === true;
  const canForceCheckout =
    isManager || rooms?.meta.is_staff_allowed_to_force_checkout === true;

  async function loadHomeData() {
    const [approvalData, attentionData, activeData] = await Promise.all([
      getAdminBookings({
        page: approvalPage,
        limit: 6,
        filter_booking_status: "on_hold",
        order: approvalOrder,
        order_by: approvalSort,
      }),
      getAdminBookings({
        page: attentionPage,
        limit: 6,
        filter_booking_status: "checked_in,checking_out",
        filter_attention: true,
        order: attentionOrder,
        order_by: attentionSort,
      }),
      getAdminBookings({
        page: activePage,
        limit: 6,
        filter_booking_status: "checked_in,checking_out",
        order: activeOrder,
        order_by: activeSort,
      }),
    ]);
    setApprovals(approvalData);
    setAttention(attentionData);
    setActiveBookings(activeData);
  }

  async function loadRoomsData() {
    const roomData = await getAdminRooms({
      page: roomsPage,
      limit: 10,
      include_booking: true,
      order: roomsOrder,
      order_by: roomsSort,
      filter_available_room: roomsAvailable,
      room_name: roomsSearch || undefined,
    });
    setRooms(roomData);
  }

  async function loadHistoryData() {
    const historyData = await getAdminBookings({
      page: historyPage,
      limit: 10,
      filter_booking_status: "checked_out,rejected",
      order: historyOrder,
      order_by: historySort,
      booking_name: historySearch || undefined,
    });
    setHistoryBookings(historyData);
  }

  async function loadUsersData() {
    if (userInfo?.type === "manager") {
      const usersData = await getAdminUsers();
      setUsers(usersData);
    }
  }

  async function loadData() {
    try {
      setError(null);
      const user = await getAdminUserInfo();
      setUserInfo(user);
      const [roomData, settingsData] = await Promise.all([
        getAdminRooms({ include_booking: true }),
        getAdminSettings(),
      ]);
      setRooms(roomData);
      setSettings(settingsData);
      setSettingsForm({
        is_auto_approve: settingsData.is_auto_approve,
        auto_approve_time: settingsData.auto_approve_time,
        checkout_grace_period: settingsData.checkout_grace_period,
        smart_door_default_pin: settingsData.smart_door_default_pin,
        qr_instructions: settingsData.qr_instructions || [],
      });
      setQrInstructionsWithIds(
        (settingsData.qr_instructions || []).map((text, index) => ({
          id: `instruction-${Date.now()}-${index}`,
          text,
        }))
      );
      setStaffPermissionsForm({
        is_staff_allowed_to_approve: settingsData.is_staff_allowed_to_approve,
        is_staff_allowed_to_force_checkout:
          settingsData.is_staff_allowed_to_force_checkout,
        is_staff_allowed_to_dissmiss_call:
          settingsData.is_staff_allowed_to_dissmiss_call,
      });
      if (user.type === "manager") setUsers(await getAdminUsers());
      await loadHomeData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshAfterAction() {
    await loadData();
  }

  useEffect(() => {
    const initialLoad = async () => {
      await loadData();
    };
    const timer = setTimeout(() => {
      initialLoad().catch((err: unknown) =>
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data",
        ),
      );
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useViewPolling({
    enabled: !loading && view === "home",
    interval: 5000,
    onPoll: loadHomeData,
    dependencies: [
      approvalPage,
      approvalSort,
      approvalOrder,
      attentionPage,
      attentionSort,
      attentionOrder,
      activePage,
      activeSort,
      activeOrder,
    ],
  });

  useViewPolling({
    enabled: !loading && view === "rooms",
    interval: 5000,
    onPoll: loadRoomsData,
    dependencies: [roomsPage, roomsSort, roomsOrder, roomsAvailable, roomsSearch],
  });

  useViewPolling({
    enabled: !loading && view === "history",
    interval: 5000,
    onPoll: loadHistoryData,
    dependencies: [historyPage, historySort, historyOrder, historySearch],
  });

  useViewPolling({
    enabled: !loading && view === "users" && isManager,
    interval: 5000,
    onPoll: loadUsersData,
    dependencies: [],
  });

  const handleLogout = () => {
    localStorage.removeItem("adminActiveToken");
    localStorage.removeItem("adminRefreshToken");
    window.location.href = "/login/admin";
  };

  const handleApprove = async (id: number) => {
    setActionError(null);
    setApprovingId(id);
    try {
      await approveBooking(id);
      await refreshAfterAction();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to approve booking",
      );
    } finally {
      setApprovingId(null);
    }
  };
  const handleReject = (id: number) => setRejectBookingId(id);
  const confirmReject = async () => {
    if (!rejectBookingId) return;
    setActionError(null);
    setRejectingId(rejectBookingId);
    try {
      await rejectBooking(rejectBookingId);
      setRejectBookingId(null);
      await refreshAfterAction();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to reject booking",
      );
    } finally {
      setRejectingId(null);
    }
  };
  const handleServeAddon = async (id: number) => {
    setActionError(null);
    setServingAddonId(id);
    try {
      await markAddonServed(id);
      await refreshAfterAction();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to mark addon as served",
      );
    } finally {
      setServingAddonId(null);
    }
  };
  const handleDismissCall = (id: number) => {
    setDismissBookingId(id);
    setDismissMessage("");
  };
  const handleForceCheckout = (id: number) => {
    setCheckoutBookingId(id);
    setCheckoutMessage("");
    setAllowGracePeriod(true);
  };
  const confirmDismissCall = async () => {
    if (!dismissBookingId || !dismissMessage.trim()) return;
    setActionError(null);
    setDismissingId(dismissBookingId);
    try {
      await dismissInnkeeperCall(dismissBookingId, dismissMessage.trim());
      setDismissBookingId(null);
      await refreshAfterAction();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to dismiss innkeeper call",
      );
    } finally {
      setDismissingId(null);
    }
  };
  const confirmForceCheckout = async () => {
    if (!checkoutBookingId || !checkoutMessage.trim()) return;
    setActionError(null);
    setForcingCheckoutId(checkoutBookingId);
    try {
      await forceCheckout(
        checkoutBookingId,
        allowGracePeriod,
        checkoutMessage.trim(),
      );
      setCheckoutBookingId(null);
      await refreshAfterAction();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to force checkout",
      );
    } finally {
      setForcingCheckoutId(null);
    }
  };

  const handleAddStaff = async () => {
    setStaffFormError(null);
    setStaffFormLoading(true);
    try {
      await createStaff(staffForm);
      setShowAddStaff(false);
      setStaffForm({ name: "", username: "", password: "" });
      await refreshAfterAction();
    } catch (err: unknown) {
      setStaffFormError(
        err instanceof Error ? err.message : "Failed to create staff",
      );
    } finally {
      setStaffFormLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteStaffId) return;
    setDeleteStaffError(null);
    setDeleteStaffLoading(true);
    try {
      await deleteStaff(deleteStaffId);
      setDeleteStaffId(null);
      await refreshAfterAction();
    } catch (err: unknown) {
      setDeleteStaffError(
        err instanceof Error ? err.message : "Failed to delete staff",
      );
    } finally {
      setDeleteStaffLoading(false);
    }
  };

  const handleSaveBookingSettings = async () => {
    if (!isManager) return;
    setSettingsError(null);
    setSettingsSaving(true);
    try {
      const updatedSettings = await updateBookingSettings({
        ...settingsForm,
      });
      setSettings(updatedSettings);
      setSettingsForm({
        is_auto_approve: updatedSettings.is_auto_approve,
        auto_approve_time: updatedSettings.auto_approve_time,
        checkout_grace_period: updatedSettings.checkout_grace_period,
        smart_door_default_pin: updatedSettings.smart_door_default_pin,
        qr_instructions: updatedSettings.qr_instructions || [],
      });
    } catch (err: unknown) {
      setSettingsError(
        err instanceof Error ? err.message : "Failed to save booking settings",
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSaveStaffPermissions = async () => {
    if (!isManager) return;
    setStaffPermissionsError(null);
    setStaffPermissionsSaving(true);
    try {
      const updatedPermissions =
        await updateStaffPermissions(staffPermissionsForm);
      setStaffPermissionsForm(updatedPermissions);
      setSettings((currentSettings) =>
        currentSettings
          ? { ...currentSettings, ...updatedPermissions }
          : currentSettings,
      );
    } catch (err: unknown) {
      setStaffPermissionsError(
        err instanceof Error ? err.message : "Failed to save staff permissions",
      );
    } finally {
      setStaffPermissionsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-neutral-50">
        <Loader2 className="animate-spin text-green-500" size={32} />
        <p className="text-sm font-semibold text-neutral-600">
          Loading admin dashboard...
        </p>
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-red-600">
            Error Loading Dashboard
          </h2>
          <p className="mt-1 text-sm text-neutral-600">{error}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                setLoading(true);
                loadData();
              }}
              className="flex-1 rounded-lg bg-green-500 py-2.5 font-semibold text-white"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 rounded-lg bg-neutral-200 py-2.5 font-semibold text-neutral-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );

  const renderBooking = (booking: AdminBookingsResponse["data"][number]) => (
    <BookingCard
      key={booking.id}
      booking={booking}
      onApprove={handleApprove}
      onReject={handleReject}
      onServeAddon={handleServeAddon}
      onDismissCall={handleDismissCall}
      onForceCheckout={handleForceCheckout}
      canApprove={canApprove}
      canDismiss={canDismiss}
      canForceCheckout={canForceCheckout}
      isApproving={approvingId === booking.id}
      isRejecting={rejectingId === booking.id}
      isServingAddon={servingAddonId === booking.id}
      isDismissing={dismissingId === booking.id}
      isForcingCheckout={forcingCheckoutId === booking.id}
    />
  );

  return (
    <div className="flex h-screen flex-col bg-neutral-50 md:flex-row overflow-hidden">
      <AdminSidebar
        activeView={view}
        isManager={isManager}
        name={userInfo?.name || "Admin"}
        isPolling={!loading && view !== "settings"}
        onChange={setView}
        onLogout={handleLogout}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto p-6">
        {actionError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-red-700">{actionError}</p>
              <button
                onClick={() => setActionError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        {view === "home" && (
          <div className="flex flex-col gap-10">
            <section className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-neutral-800">Home</h2>
                <p className="text-sm text-neutral-500">
                  Live operations overview
                </p>
              </div>
              <div className="flex gap-3">
                <article className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2">
                  <p className="text-xs font-semibold text-orange-700">
                    Innkeeper Calls
                  </p>
                  <p className="text-2xl font-bold text-orange-800">
                    {attention?.data.filter(
                      (booking) => booking.isInnkeeperCalled,
                    ).length ?? 0}
                  </p>
                </article>
                <article className="rounded-lg border border-green-200 bg-green-50 px-4 py-2">
                  <p className="text-xs font-semibold text-green-700">
                    Pending Addons
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {attention?.data.filter((booking) => !booking.isAddonServed)
                      .length ?? 0}
                  </p>
                </article>
              </div>
            </section>
            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-neutral-800">
                    Approval Needed
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {settings?.is_auto_approve
                      ? `Auto-approve after ${settings.auto_approve_time} minutes`
                      : "Manual approval required"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={approvalSort}
                    onChange={(e) => {
                      setApprovalSort(e.target.value);
                      setApprovalPage(1);
                    }}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
                  >
                    <option value="createdAt">Created</option>
                    <option value="name">Guest</option>
                    <option value="price">Price</option>
                  </select>
                  <select
                    value={approvalOrder}
                    onChange={(e) => {
                      setApprovalOrder(e.target.value as "asc" | "desc");
                      setApprovalPage(1);
                    }}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
                  >
                    {approvalSort === "createdAt" ||
                    approvalSort === "updatedAt" ? (
                      <>
                        <option value="asc">Oldest first</option>
                        <option value="desc">Newest first</option>
                      </>
                    ) : approvalSort === "price" ? (
                      <>
                        <option value="asc">Lowest first</option>
                        <option value="desc">Highest first</option>
                      </>
                    ) : (
                      <>
                        <option value="asc">A–Z</option>
                        <option value="desc">Z–A</option>
                      </>
                    )}
                  </select>
                  <Pagination
                    page={approvals?.meta.page ?? 1}
                    pageEnd={approvals?.meta.page_end ?? 0}
                    hasBefore={approvals?.meta.has_page_before ?? false}
                    hasAfter={approvals?.meta.has_page_after ?? false}
                    onPageChange={setApprovalPage}
                  />
                </div>
              </div>
              {approvals?.data.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {approvals.data.map(renderBooking)}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                  No bookings waiting for approval.
                </p>
              )}
            </section>
            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-neutral-800">
                    Need Attention
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Innkeeper calls and unserved addons
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={attentionSort}
                    onChange={(e) => {
                      setAttentionSort(e.target.value);
                      setAttentionPage(1);
                    }}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
                  >
                    <option value="updatedAt">Updated</option>
                    <option value="createdAt">Created</option>
                    <option value="name">Guest</option>
                  </select>
                  <select
                    value={attentionOrder}
                    onChange={(e) => {
                      setAttentionOrder(e.target.value as "asc" | "desc");
                      setAttentionPage(1);
                    }}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
                  >
                    {attentionSort === "createdAt" ||
                    attentionSort === "updatedAt" ? (
                      <>
                        <option value="asc">Oldest first</option>
                        <option value="desc">Newest first</option>
                      </>
                    ) : attentionSort === "price" ? (
                      <>
                        <option value="asc">Lowest first</option>
                        <option value="desc">Highest first</option>
                      </>
                    ) : (
                      <>
                        <option value="asc">A–Z</option>
                        <option value="desc">Z–A</option>
                      </>
                    )}
                  </select>
                  <Pagination
                    page={attention?.meta.page ?? 1}
                    pageEnd={attention?.meta.page_end ?? 0}
                    hasBefore={attention?.meta.has_page_before ?? false}
                    hasAfter={attention?.meta.has_page_after ?? false}
                    onPageChange={setAttentionPage}
                  />
                </div>
              </div>
              {attention?.data.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {attention.data.map(renderBooking)}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                  No calls or pending addon requests.
                </p>
              )}
            </section>
            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-neutral-800">
                    Active Bookings
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Current stays and checkout actions
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={activeSort}
                    onChange={(e) => {
                      setActiveSort(e.target.value);
                      setActivePage(1);
                    }}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
                  >
                    <option value="updatedAt">Updated</option>
                    <option value="createdAt">Created</option>
                    <option value="name">Guest</option>
                  </select>
                  <select
                    value={activeOrder}
                    onChange={(e) => {
                      setActiveOrder(e.target.value as "asc" | "desc");
                      setActivePage(1);
                    }}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
                  >
                    {activeSort === "createdAt" || activeSort === "updatedAt" ? (
                      <>
                        <option value="asc">Oldest first</option>
                        <option value="desc">Newest first</option>
                      </>
                    ) : (
                      <>
                        <option value="asc">A–Z</option>
                        <option value="desc">Z–A</option>
                      </>
                    )}
                  </select>
                  <Pagination
                    page={activeBookings?.meta.page ?? 1}
                    pageEnd={activeBookings?.meta.page_end ?? 0}
                    hasBefore={activeBookings?.meta.has_page_before ?? false}
                    hasAfter={activeBookings?.meta.has_page_after ?? false}
                    onPageChange={setActivePage}
                  />
                </div>
              </div>
              {activeBookings?.data.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {activeBookings.data.map(renderBooking)}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                  No active bookings.
                </p>
              )}
            </section>

          </div>
        )}
        {view === "rooms" && (
          <div className="flex flex-col gap-6">
            <section>
              <h2 className="text-2xl font-bold text-neutral-800">Rooms</h2>
              <p className="text-sm text-neutral-500">
                Real-time status of smart units
              </p>
            </section>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={roomsSearch}
                onChange={(e) => {
                  setRoomsSearch(e.target.value);
                  setRoomsPage(1);
                }}
                placeholder="Search room name..."
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              />
              <select
                value={roomsAvailable}
                onChange={(e) => {
                  setRoomsAvailable(
                    e.target.value as "true" | "false" | "both",
                  );
                  setRoomsPage(1);
                }}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              >
                <option value="both">All</option>
                <option value="true">Available</option>
                <option value="false">Occupied</option>
              </select>
              <select
                value={roomsSort}
                onChange={(e) => {
                  setRoomsSort(e.target.value);
                  setRoomsPage(1);
                }}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="capacity">Capacity</option>
              </select>
              <select
                value={roomsOrder}
                onChange={(e) => {
                  setRoomsOrder(e.target.value as "asc" | "desc");
                  setRoomsPage(1);
                }}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              <Pagination
                page={rooms?.meta.page ?? 1}
                pageEnd={rooms?.meta.page_end ?? 0}
                hasBefore={rooms?.meta.has_page_before ?? false}
                hasAfter={rooms?.meta.has_page_after ?? false}
                onPageChange={setRoomsPage}
              />
            </div>
            {rooms?.data.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rooms.data.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                No rooms configured.
              </p>
            )}
          </div>
        )}
        {view === "history" && (
          <div className="flex flex-col gap-6">
            <section>
              <h2 className="text-2xl font-bold text-neutral-800">History</h2>
              <p className="text-sm text-neutral-500">
                Archived and past bookings
              </p>
            </section>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setHistoryPage(1);
                }}
                placeholder="Search guest name..."
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              />
              <select
                value={historySort}
                onChange={(e) => {
                  setHistorySort(e.target.value);
                  setHistoryPage(1);
                }}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              >
                <option value="checkedOutAt">Checked Out</option>
                <option value="createdAt">Created</option>
                <option value="name">Guest</option>
                <option value="price">Price</option>
              </select>
              <select
                value={historyOrder}
                onChange={(e) => {
                  setHistoryOrder(e.target.value as "asc" | "desc");
                  setHistoryPage(1);
                }}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              >
                {historySort === "createdAt" || historySort === "updatedAt" || historySort === "checkedOutAt" ? (
                  <>
                    <option value="asc">Oldest first</option>
                    <option value="desc">Newest first</option>
                  </>
                ) : historySort === "price" ? (
                  <>
                    <option value="asc">Lowest first</option>
                    <option value="desc">Highest first</option>
                  </>
                ) : (
                  <>
                    <option value="asc">A–Z</option>
                    <option value="desc">Z–A</option>
                  </>
                )}
              </select>
              <Pagination
                page={historyBookings?.meta.page ?? 1}
                pageEnd={historyBookings?.meta.page_end ?? 0}
                hasBefore={historyBookings?.meta.has_page_before ?? false}
                hasAfter={historyBookings?.meta.has_page_after ?? false}
                onPageChange={setHistoryPage}
              />
            </div>
            {historyBookings?.data.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {historyBookings.data.map(renderBooking)}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                No archived bookings.
              </p>
            )}
          </div>
        )}
        {view === "users" && (
          <div className="flex flex-col gap-6">
            <section className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-neutral-800">Users</h2>
                <p className="text-sm text-neutral-500">
                  Manager accounts only
                </p>
              </div>
              {isManager && (
                <button
                  onClick={() => setShowAddStaff(true)}
                  className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-900 transition-colors"
                >
                  <UserPlus size={16} /> Add Staff
                </button>
              )}
            </section>
            {!isManager ? (
              <p className="text-sm font-semibold text-red-600">
                Access restricted to manager accounts.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {users?.data.length ? (
                  users.data.map((u) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-800">
                            {u.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            @{u.username} ·{" "}
                            <span className="capitalize">{u.type}</span>
                          </p>
                          <p className="text-xs text-neutral-400">
                            Created: {new Date(u.createdAt).toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric", 
                              year: "numeric" 
                            })}
                          </p>
                        </div>
                      </div>
                      {u.type === "staff" && (
                        <button
                          onClick={() => setDeleteStaffId(u.id)}
                          className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                      {u.type === "manager" && (
                        <span className="flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                          <ShieldCheck size={14} /> Manager
                        </span>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                    No users found.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        {view === "settings" && (
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="text-2xl font-bold text-neutral-800">Settings</h2>
              <p className="text-sm text-neutral-500">
                Configure approval, room access, and staff controls.
              </p>
            </section>
            {settings && (
              <>
                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-neutral-800">
                      Booking settings
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Approval and checkout rules.
                      {!isManager && " Only managers can edit."}
                    </p>
                  </div>
                  {settingsError && (
                    <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                      {settingsError}
                    </p>
                  )}
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="flex items-center justify-between gap-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                      <span>
                        <span className="block text-sm font-semibold text-neutral-800">
                          Auto Approve Approval
                        </span>
                        <span className="block text-xs text-neutral-500">
                          Approve pending bookings automatically.
                        </span>
                      </span>
                      <input
                        checked={settingsForm.is_auto_approve}
                        disabled={!isManager || settingsSaving}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            is_auto_approve: e.target.checked,
                          })
                        }
                        type="checkbox"
                        className="h-5 w-5 accent-green-600 disabled:opacity-50"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                      <span>
                        <span className="block text-sm font-semibold text-neutral-800">
                          Auto Approve Time
                        </span>
                        <span className="block text-xs text-neutral-500">
                          Delay before automatic approval.
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={1440}
                          disabled={!isManager || settingsSaving}
                          value={settingsForm.auto_approve_time}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              auto_approve_time: Number(e.target.value),
                            })
                          }
                          className="w-20 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 disabled:opacity-50"
                        />
                        <span className="text-sm text-neutral-500">min</span>
                      </div>
                    </label>
                    <label className="flex items-center justify-between gap-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                      <span>
                        <span className="block text-sm font-semibold text-neutral-800">
                          Default Door PIN
                        </span>
                        <span className="block text-xs text-neutral-500">
                          Used after checkout resets room access.
                        </span>
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        disabled={!isManager || settingsSaving}
                        value={settingsForm.smart_door_default_pin}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            smart_door_default_pin: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          })
                        }
                        className="w-28 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 font-mono disabled:opacity-50"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                      <span>
                        <span className="block text-sm font-semibold text-neutral-800">
                          Checkout Grace Period
                        </span>
                        <span className="block text-xs text-neutral-500">
                          Time guest can remain after checkout.
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={1440}
                          disabled={!isManager || settingsSaving}
                          value={settingsForm.checkout_grace_period}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              checkout_grace_period: Number(e.target.value),
                            })
                          }
                          className="w-20 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 disabled:opacity-50"
                        />
                        <span className="text-sm text-neutral-500">min</span>
                      </div>
                    </label>
                  </div>
                  {isManager && (
                    <div className="mt-5 flex justify-end">
                      <button
                        disabled={settingsSaving}
                        onClick={handleSaveBookingSettings}
                        className="rounded-lg bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-900 disabled:opacity-50 transition-colors"
                      >
                        {settingsSaving ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  )}
                </section>
                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-neutral-800">
                      Staff permissions
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Actions staff accounts may perform.
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-sm font-semibold text-neutral-800">
                      Approve bookings
                      <input
                        checked={
                          staffPermissionsForm.is_staff_allowed_to_approve
                        }
                        disabled={!isManager || staffPermissionsSaving}
                        onChange={(e) =>
                          setStaffPermissionsForm({
                            ...staffPermissionsForm,
                            is_staff_allowed_to_approve: e.target.checked,
                          })
                        }
                        type="checkbox"
                        className="h-5 w-5 accent-green-600 disabled:opacity-50"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-sm font-semibold text-neutral-800">
                      Dismiss calls
                      <input
                        checked={
                          staffPermissionsForm.is_staff_allowed_to_dissmiss_call
                        }
                        disabled={!isManager || staffPermissionsSaving}
                        onChange={(e) =>
                          setStaffPermissionsForm({
                            ...staffPermissionsForm,
                            is_staff_allowed_to_dissmiss_call: e.target.checked,
                          })
                        }
                        type="checkbox"
                        className="h-5 w-5 accent-green-600 disabled:opacity-50"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-sm font-semibold text-neutral-800">
                      Force checkout
                      <input
                        checked={
                          staffPermissionsForm.is_staff_allowed_to_force_checkout
                        }
                        disabled={!isManager || staffPermissionsSaving}
                        onChange={(e) =>
                          setStaffPermissionsForm({
                            ...staffPermissionsForm,
                            is_staff_allowed_to_force_checkout:
                              e.target.checked,
                          })
                        }
                        type="checkbox"
                        className="h-5 w-5 accent-green-600 disabled:opacity-50"
                      />
                    </label>
                  </div>
                  {staffPermissionsError && (
                    <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {staffPermissionsError}
                    </p>
                  )}
                  {isManager ? (
                    <div className="mt-5 flex justify-end">
                      <button
                        disabled={staffPermissionsSaving}
                        onClick={handleSaveStaffPermissions}
                        className="rounded-lg bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-900 disabled:opacity-50"
                      >
                        {staffPermissionsSaving ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-neutral-500">
                      Only managers can edit staff permissions.
                    </p>
                  )}
                </section>
                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-neutral-800">
                      QR Code Instructions
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Step-by-step guide displayed on QR code pages.
                      {!isManager && " Only managers can edit."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Reorder.Group
                      axis="y"
                      values={qrInstructionsWithIds}
                      onReorder={(newOrder) => {
                        setQrInstructionsWithIds(newOrder);
                        setSettingsForm({
                          ...settingsForm,
                          qr_instructions: newOrder.map((item) => item.text),
                        });
                      }}
                      className="flex flex-col gap-3"
                    >
                      {qrInstructionsWithIds.map((item, index) => (
                        <Reorder.Item
                          key={item.id}
                          value={item}
                          className="flex items-center gap-2"
                        >
                          {isManager && !settingsSaving && (
                            <div className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 transition-colors">
                              <GripVertical size={20} />
                            </div>
                          )}
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">
                            {index + 1}
                          </span>
                          <input
                            value={item.text}
                            disabled={!isManager || settingsSaving}
                            onChange={(e) => {
                              const newInstructions = [...qrInstructionsWithIds];
                              newInstructions[index] = {
                                ...newInstructions[index],
                                text: e.target.value,
                              };
                              setQrInstructionsWithIds(newInstructions);
                              setSettingsForm({
                                ...settingsForm,
                                qr_instructions: newInstructions.map((i) => i.text),
                              });
                            }}
                            placeholder={`Step ${index + 1}`}
                            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
                          />
                          {isManager && !settingsSaving && (
                            <button
                              onClick={() => {
                                const newInstructions = qrInstructionsWithIds.filter(
                                  (_, i) => i !== index,
                                );
                                setQrInstructionsWithIds(newInstructions);
                                setSettingsForm({
                                  ...settingsForm,
                                  qr_instructions: newInstructions.map((i) => i.text),
                                });
                              }}
                              className="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                    {isManager && !settingsSaving && (
                      <button
                        onClick={() => {
                          const newItem = {
                            id: `instruction-${Date.now()}`,
                            text: "",
                          };
                          setQrInstructionsWithIds([...qrInstructionsWithIds, newItem]);
                          setSettingsForm({
                            ...settingsForm,
                            qr_instructions: [...settingsForm.qr_instructions, ""],
                          });
                        }}
                        className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
                      >
                        + Add instruction step
                      </button>
                    )}
                  </div>
                  {isManager && (
                    <div className="mt-5 flex justify-end">
                      <button
                        disabled={settingsSaving}
                        onClick={handleSaveBookingSettings}
                        className="rounded-lg bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-900 disabled:opacity-50 transition-colors"
                      >
                        {settingsSaving ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  )}
                </section>
                <section className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6">
                  <h3 className="text-lg font-bold text-neutral-800">
                    Experimental settings
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Room door state, water output, electricity output, and alarm
                    controls require hardware endpoints.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      "Door lock state",
                      "Door open state",
                      "Door alarm state",
                      "Water output",
                      "Electricity output",
                      "Fire alarm state",
                    ].map((label) => (
                      <button
                        key={label}
                        disabled
                        className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-left text-sm font-semibold text-neutral-400"
                      >
                        {label}
                        <span className="mt-1 block text-xs font-normal">
                          Unavailable
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAddStaff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!staffFormLoading) {
                setShowAddStaff(false);
                setStaffFormError(null);
                setStaffForm({ name: "", username: "", password: "" });
              }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault();
                handleAddStaff();
              }}
              className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-white p-6 shadow-xl"
            >
              <div>
                <h3 className="text-lg font-bold text-neutral-800">
                  Add Staff
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Staff can access daily room operations.
                </p>
              </div>
              {staffFormError && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {staffFormError}
                </p>
              )}
              <input
                required
                disabled={staffFormLoading}
                value={staffForm.name}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, name: e.target.value })
                }
                placeholder="Full name"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:opacity-50"
              />
              <input
                required
                minLength={3}
                disabled={staffFormLoading}
                value={staffForm.username}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, username: e.target.value })
                }
                placeholder="Username"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:opacity-50"
              />
              <input
                required
                minLength={3}
                type="password"
                disabled={staffFormLoading}
                value={staffForm.password}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, password: e.target.value })
                }
                placeholder="Password"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:opacity-50"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={staffFormLoading}
                  onClick={() => {
                    setShowAddStaff(false);
                    setStaffFormError(null);
                    setStaffForm({ name: "", username: "", password: "" });
                  }}
                  className="flex-1 rounded-lg bg-neutral-100 py-2 font-semibold text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={staffFormLoading}
                  className="flex-1 rounded-lg bg-neutral-800 py-2 font-semibold text-white hover:bg-neutral-900 disabled:opacity-50"
                >
                  {staffFormLoading ? "Adding..." : "Add Staff"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteStaffId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!deleteStaffLoading) {
                setDeleteStaffId(null);
                setDeleteStaffError(null);
              }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-white p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Delete Staff Account
              </h3>
              <p className="text-sm text-neutral-600">
                Remove this staff account permanently? They will lose dashboard
                access.
              </p>
              {deleteStaffError && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {deleteStaffError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  disabled={deleteStaffLoading}
                  onClick={() => {
                    setDeleteStaffId(null);
                    setDeleteStaffError(null);
                  }}
                  className="flex-1 rounded-lg bg-neutral-100 py-2 font-semibold text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteStaffLoading}
                  onClick={handleDeleteStaff}
                  className="flex-1 rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteStaffLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dismiss Call Modal */}
      <AnimatePresence>
        {dismissBookingId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl flex flex-col gap-4"
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Dismiss Innkeeper Call
              </h3>
              <p className="text-sm text-neutral-600">
                Provide a reason or message for dismissing this innkeeper call
                notification.
              </p>
              <textarea
                className="w-full h-24 border border-neutral-300 rounded-lg p-2 text-sm focus:outline-none focus:border-neutral-500 bg-transparent resize-none"
                placeholder="E.g. Addon served, issue resolved."
                value={dismissMessage}
                onChange={(e) => setDismissMessage(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setDismissBookingId(null)}
                  className="flex-1 py-2 rounded-lg font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!dismissMessage.trim()}
                  onClick={confirmDismissCall}
                  className="flex-1 py-2 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Force Checkout Modal */}
      <AnimatePresence>
        {checkoutBookingId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl flex flex-col gap-4"
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Force Checkout Room
              </h3>
              <p className="text-sm text-neutral-600">
                Provide a checkout reason and choose if grace period should be
                allowed.
              </p>
              <textarea
                className="w-full h-24 border border-neutral-300 rounded-lg p-2 text-sm focus:outline-none focus:border-neutral-500 bg-transparent resize-none"
                placeholder="E.g. Guest checkout requested, lease expired."
                value={checkoutMessage}
                onChange={(e) => setCheckoutMessage(e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm text-neutral-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowGracePeriod}
                  onChange={(e) => setAllowGracePeriod(e.target.checked)}
                  className="rounded border-neutral-300 text-green-600 focus:ring-green-500"
                />
                Allow Checkout Grace Period
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setCheckoutBookingId(null)}
                  className="flex-1 py-2 rounded-lg font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!checkoutMessage.trim()}
                  onClick={confirmForceCheckout}
                  className="flex-1 py-2 rounded-lg font-semibold text-white bg-neutral-800 hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Checkout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Booking Modal */}
      <AnimatePresence>
        {rejectBookingId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl flex flex-col gap-4"
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Refuse Booking Request
              </h3>
              <p className="text-sm text-neutral-600">
                Are you sure you want to refuse this booking request? The room
                will be set back to available and a rejection WhatsApp message
                will be sent to the occupier.
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setRejectBookingId(null)}
                  className="flex-1 py-2 rounded-lg font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  className="flex-1 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Refuse
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
