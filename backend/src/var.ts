// this page is like .env but for non-sensitive and important settings.
// contain database seed values, change only before seeding

// admin table value after initialized
export const admin_is_auto_approve = true
export const admin_auto_approve_time = 10
export const admin_smart_door_default_pin = 157359
export const addons_data = [
    {
        addon: "Extra Bed",
        price: 120000,
        borrowMaximum: 1
    },
    {
        addon: "Hanger",
        price: 2000,
        borrowMaximum: 10
    },
    {
        addon: "Body Cleaning Kit",
        price: 65000,
        borrowMaximum: 10
    },
    {
        addon: "Towel",
        price: 20000,
        borrowMaximum: 10
    },
]
export const rooms_data = [
    {
        name: "VIP Space",
        price: 83000,
        addons: [1, 2, 3, 4],
        features: [
            "King-sized Premium Bed",
            "Private Ensuite Bathroom & Water Heater",
            "Smart Door Access & Keyless Entry",
            "High-Speed Wi-Fi (up to 100 Mbps)",
            "Dedicated Executive Desk & Ergonomic Chair",
            "50-inch Smart TV with Streaming Services",
            "Mini Refrigerator & Coffee Machine",
            "Air Conditioning with Climate Control",
        ]
    }, 
    {
        name: "Golden Space",
        price: 63000,
        addons: [1, 2, 3, 4],
        features: [
            "Queen-sized Comfortable Bed",
            "Private Bathroom & Shower",
            "Smart Door Access",
            "High-Speed Wi-Fi",
            "Work Desk & Standard Chair",
            "Air Conditioning",
            "Wardrobe & Storage Cabinet",
        ]
    }, 
    {
        name: "Basic Space",
        price: 40000,
        addons: [2, 3, 4],
        features: [
            "Single Size Comfort Bed",
            "Shared Bathroom Access",
            "Standard Wi-Fi Access",
            "Compact Work Desk & Chair",
            "Air Conditioning",
            "Clothes Rack",
        ]
    }, 
    {
        name: "Student Space",
        price: 26000,
        addons: [2],
        features: [
            "Single Bed",
            "Shared Bathroom Access",
            "Standard Wi-Fi Access",
            "Study Desk & Chair",
            "Standing Fan",
            "Personal Storage Locker",
        ]
    }, 
];
