// this page is like .env but for non-sensitive and important settings.
// contain database seed values, change only before seeding

// admin table value after initialized
export const admin_is_auto_approve = true;
export const admin_auto_approve_time = 10;
export const admin_smart_door_default_pin = '157359';
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
    price: 83000,
    capacity: 4,
    description:
      'An exceptional luxury suite designed for top-tier comfort and productivity. Features premium amenities, smart tech integration, and dedicated executive living space ideal for guests seeking an elevated stay.',
    addons: [1, 2, 3, 4],
    features: [
      'King-sized Premium Bed',
      'Private Ensuite Bathroom & Water Heater',
      'Smart Door Access & Keyless Entry',
      'High-Speed Wi-Fi (up to 100 Mbps)',
      'Dedicated Executive Desk & Ergonomic Chair',
      '50-inch Smart TV with Streaming Services',
      'Mini Refrigerator & Coffee Machine',
      'Air Conditioning with Climate Control',
    ],
  },
  {
    name: 'Golden Space',
    price: 63000,
    capacity: 4,
    description:
      'A spacious and modern room balancing comfort with premium convenience. Perfect for small groups or travelers who want private facilities, high-speed connectivity, and full air conditioning.',
    addons: [1, 2, 3, 4],
    features: [
      'Queen-sized Comfortable Bed',
      'Private Bathroom & Shower',
      'Smart Door Access',
      'High-Speed Wi-Fi',
      'Work Desk & Standard Chair',
      'Air Conditioning',
      'Wardrobe & Storage Cabinet',
    ],
  },
  {
    name: 'Basic Space',
    price: 40000,
    capacity: 2,
    description:
      'A cozy and practical accommodation option tailored for budget-conscious guests. Offers essential comforts including air conditioning, reliable Wi-Fi, and a dedicated workspace.',
    addons: [2, 3, 4],
    features: [
      'Single Size Comfort Bed',
      'Shared Bathroom Access',
      'Standard Wi-Fi Access',
      'Compact Work Desk & Chair',
      'Air Conditioning',
      'Clothes Rack',
    ],
  },
  {
    name: 'Student Space',
    price: 26000,
    capacity: 2,
    description:
      'An ultra-affordable, functional living unit geared towards students and solo travelers. Comes with dedicated study furniture, personal secure storage, and shared amenities.',
    addons: [2],
    features: [
      'Single Bed',
      'Shared Bathroom Access',
      'Standard Wi-Fi Access',
      'Study Desk & Chair',
      'Standing Fan',
      'Personal Storage Locker',
    ],
  },
];
