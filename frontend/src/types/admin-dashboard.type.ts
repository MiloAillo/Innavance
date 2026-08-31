export interface AdminUserInfo {
  id: number;
  name: string;
  type: "manager" | "staff";
  username: string;
}

export interface AdminRoomBooking {
  id: number;
  room_id: number;
  status:
    "on_hold" | "rejected" | "checked_in" | "checking_out" | "checked_out";
  name: string;
  phoneNumber: string;
  duration: number;
  price: number;
  paymentMethod: string;
  isAddonServed: boolean;
  isInnkeeperCalled: boolean;
  isAutoApprove: boolean;
  checkoutGraceTime: number | null;
  autoApproveTime: number | null;
  createdAt: string;
  updatedAt: string;
  checkedOutAt: string | null;
}

export interface AdminRoom {
  id: number;
  name: string;
  price: number;
  capacity: number;
  isAvailable: boolean;
  smartDoorPin: string;
  smartDoorIsLocked: boolean;
  smartDoorIsOpened: boolean;
  electricityOutput: number;
  waterOutput: number;
  accountId: string | null;
  bookings: AdminRoomBooking[];
}

export interface AdminRoomsMeta {
  is_staff_allowed_to_approve: boolean;
  is_staff_allowed_to_dismiss_call: boolean;
  is_staff_allowed_to_force_checkout: boolean;
  page: number;
  order: "asc" | "desc";
  order_by: string;
  has_page_before: boolean;
  has_page_after: boolean;
  page_end: number;
}

export interface AdminRoomsResponse {
  data: AdminRoom[];
  meta: AdminRoomsMeta;
}

export interface AdminBooking {
  id: number;
  room_id: number;
  status:
    "on_hold" | "rejected" | "checked_in" | "checking_out" | "checked_out";
  name: string;
  phoneNumber: string;
  duration: number;
  price: number;
  paymentMethod: string;
  isAddonServed: boolean;
  isInnkeeperCalled: boolean;
  isAutoApprove: boolean;
  checkoutGraceTime: number | null;
  autoApproveTime: number | null;
  createdAt: string;
  updatedAt: string;
  checkedOutAt: string | null;
  bookingRoom: {
    id: number;
    name: string;
    price: number;
    capacity: number;
    isAvailable: boolean;
  };
  bookingsAddons: {
    count: number;
    addonAddon: {
      addon: string;
    };
  }[];
}

export interface AdminBookingsMeta {
  total: number;
  page: number;
  order: "asc" | "desc";
  order_by: string;
  has_page_before: boolean;
  has_page_after: boolean;
  page_end: number;
}

export interface AdminBookingsResponse {
  data: AdminBooking[];
  meta: AdminBookingsMeta;
}

export interface AdminUser {
  id: number;
  admin_id: number;
  type: "manager" | "staff";
  name: string;
  username: string;
  createdAt: string;
  userAdmin: {
    id: number;
    isAutoApprove: boolean;
    autoApproveTime: number;
    checkOutGracePeriod: number;
    isStaffAllowedToApprove: boolean;
    isStaffAllowedToForceCheckout: boolean;
    isStaffAllowedToDismissCall: boolean;
  };
}

export interface AdminUsersMeta {
  page: number;
  order: "asc" | "desc";
  order_by: string;
  has_page_before: boolean;
  has_page_after: boolean;
  page_end: number;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  meta: AdminUsersMeta;
}

export interface AdminSettings {
  is_auto_approve: boolean;
  auto_approve_time: number;
  smart_door_default_pin: string;
  checkout_grace_period: number;
  is_staff_allowed_to_approve: boolean;
  is_staff_allowed_to_force_checkout: boolean;
  is_staff_allowed_to_dissmiss_call: boolean;
  qr_instructions: string[];
}

export interface StaffPermissions {
  is_staff_allowed_to_approve: boolean;
  is_staff_allowed_to_force_checkout: boolean;
  is_staff_allowed_to_dissmiss_call: boolean;
}

export interface AdminDashboardState {
  user: AdminUserInfo | null;
  rooms: AdminRoomsResponse | null;
  bookings: AdminBookingsResponse | null;
  users: AdminUsersResponse | null;
  settings: AdminSettings | null;
}
