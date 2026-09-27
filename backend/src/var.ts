// this page is like .env but for non-sensitive and important settings.
// contain database seed values, change only before seeding

// admin table value after initialized
export const admin_is_auto_approve = true;
export const admin_auto_approve_time = 0;
export const admin_smart_door_default_pin = '000000';
export const admin_checkout_grace_period = 3;
export const admin_staff_allowed_to_approve = true;
export const admin_staff_allowed_to_force_checkout = true;
export const admin_staff_allowed_to_dismiss_call = true;
export const admin_qr_instructions = [
  'Scan the QR code to book the room',
  'Enter the room PIN code we sent to your number',
  'Login to the room dashboard and enjoy the room',
  'Before leaving, click checkout ',
  'Go to the front desk to finalize payment',
];
export const addons_data = [
  {
    addon: 'Extra Bed',
    price: 120000,
    borrowMaximum: 1,
    totalStock: 5,
    isActive: true,
  },
  {
    addon: 'Hanger',
    price: 2000,
    borrowMaximum: 10,
    totalStock: 50,
    isActive: true,
  },
  {
    addon: 'Body Cleaning Kit',
    price: 65000,
    borrowMaximum: 10,
    totalStock: 30,
    isActive: true,
  },
  {
    addon: 'Towel',
    price: 20000,
    borrowMaximum: 10,
    totalStock: 50,
    isActive: true,
  },
];
export const rooms_data = [
  {
    name: 'VIP Space',
    price: 308137,
    capacity: 4,
    addons: [1, 2, 3, 4],
    features: [
      'Double Bed',
      'Bathroom with Bathub & Heater',
      'Air Conditioning',
      'Super Fast Wifi Access',
      'Dedicated Storage Room',
      'Smart TV',
    ],
  },
  {
    name: 'Golden Space',
    price: 274542,
    capacity: 4,
    addons: [1, 2, 3, 4],
    features: [
      'Double Bed',
      'Bathroom with Heater',
      'Air Conditioning',
      'Dedicated Wifi Access',
      'Multi Shelves Closet',
      'Smart TV',
    ],
  },
  {
    name: 'Basic Space',
    price: 227233,
    capacity: 2,
    addons: [2, 3, 4],
    features: [
      'Single Bed',
      'Private Bathroom',
      'Air Conditioning',
      'Standard Closet',
    ],
  },
  {
    name: 'Student Space',
    price: 213688,
    capacity: 2,
    addons: [2],
    features: [
      'Single Bed',
      'Study Desk & Chair',
      'Standing Fan',
      'Standard Closet',
    ],
  },
];
