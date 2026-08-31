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
  },
  {
    addon: 'Hanger',
    price: 2000,
    borrowMaximum: 10,
  },
  {
    addon: 'Body Cleaning Kit',
    price: 65000,
    borrowMaximum: 10,
  },
  {
    addon: 'Towel',
    price: 20000,
    borrowMaximum: 10,
  },
];
export const rooms_data = [
  {
    name: 'VIP Space',
    price: 308137,
    capacity: 4,
    description:
      'An exceptional luxury suite designed for top-tier comfort and productivity. Features premium amenities, smart tech integration, and dedicated executive living space ideal for guests seeking an elevated stay.',
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
    description:
      'A spacious and modern room balancing comfort with premium convenience. Perfect for small groups or travelers who want private facilities, high-speed connectivity, and full air conditioning.',
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
    description:
      'A cozy and practical accommodation option tailored for budget-conscious guests. Offers essential comforts including air conditioning, reliable Wi-Fi, and a dedicated workspace.',
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
    description:
      'An ultra-affordable, functional living unit geared towards students and solo travelers. Comes with dedicated study furniture, personal secure storage, and shared amenities.',
    addons: [2],
    features: [
      'Single Bed',
      'Study Desk & Chair',
      'Standing Fan',
      'Standard Closet',
    ],
  },
];
