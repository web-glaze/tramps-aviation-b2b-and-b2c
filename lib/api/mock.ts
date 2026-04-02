// ══════════════════════════════════════════════════════════════════════
// MOCK DATA — used when NEXT_PUBLIC_USE_MOCK=true
// All data is realistic Indian travel platform data
// ══════════════════════════════════════════════════════════════════════

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

// ── Agent ──────────────────────────────────────────────────────────────────
export const MOCK_AGENT = {
  _id: 'agent_mock_001',
  agentId: 'AG20240001',
  agencyName: 'Sunrise Travels Pvt Ltd',
  contactPerson: 'Rajesh Sharma',
  email: 'rajesh@sunrisetravels.in',
  phone: '+91-9876543210',
  city: 'Mumbai',
  state: 'Maharashtra',
  role: 'agent',
  kycStatus: 'approved',
  status: 'active',
  walletBalance: 125000,
  creditLimit: 50000,
  totalBookings: 234,
  totalRevenue: 3850000,
  createdAt: '2024-01-15T10:30:00Z',
}

// ── Customer ───────────────────────────────────────────────────────────────
export const MOCK_CUSTOMER = {
  _id: 'customer_mock_001',
  firstName: 'Priya',
  lastName: 'Mehta',
  email: 'priya.mehta@gmail.com',
  phone: '+91-9876512345',
  role: 'customer',
  totalBookings: 8,
  loyaltyPoints: 1250,
  loyaltyTier: 'silver',
  createdAt: '2024-03-20T08:00:00Z',
}

// ── Admin ──────────────────────────────────────────────────────────────────
export const MOCK_ADMIN = {
  _id: 'admin_mock_001',
  name: 'Admin User',
  email: 'admin@travelplatform.com',
  role: 'admin',
}

// ── Wallet ─────────────────────────────────────────────────────────────────
export const MOCK_WALLET = {
  _id: 'wallet_mock_001',
  agentId: 'agent_mock_001',
  balance: 125000,
  creditLimit: 50000,
  holdAmount: 0,
  availableBalance: 175000,
  isFrozen: false,
  lastTransactionAt: new Date().toISOString(),
}

// ── Wallet Transactions ────────────────────────────────────────────────────
export const MOCK_TRANSACTIONS = [
  {
    _id: 'txn_001',
    txnId: 'TXN20240001',
    type: 'credit',
    amount: 50000,
    balanceBefore: 75000,
    balanceAfter: 125000,
    description: 'Admin credit: Wallet top-up',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'txn_002',
    txnId: 'TXN20240002',
    type: 'debit',
    amount: 8450,
    balanceBefore: 133450,
    balanceAfter: 125000,
    description: 'Booking deduction: TRV-20240310-X7K2M1',
    referenceId: 'TRV-20240310-X7K2M1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'txn_003',
    txnId: 'TXN20240003',
    type: 'credit',
    amount: 1500,
    balanceBefore: 131950,
    balanceAfter: 133450,
    description: 'Commission credit',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'txn_004',
    txnId: 'TXN20240004',
    type: 'debit',
    amount: 12200,
    balanceBefore: 144150,
    balanceAfter: 131950,
    description: 'Booking deduction: TRV-20240308-P9L4Q2',
    referenceId: 'TRV-20240308-P9L4Q2',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'txn_005',
    txnId: 'TXN20240005',
    type: 'credit',
    amount: 100000,
    balanceBefore: 44150,
    balanceAfter: 144150,
    description: 'Admin credit: Monthly recharge',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ── Bookings ───────────────────────────────────────────────────────────────
export const MOCK_BOOKINGS = [
  {
    _id: 'booking_001',
    bookingRef: 'TRV-20240310-X7K2M1',
    bookingType: 'B2B',
    status: 'confirmed',
    pnr: 'ABC123',
    contactEmail: 'passenger@example.com',
    contactPhone: '+91-9876543210',
    segments: [
      {
        flightNumber: '6E-205',
        airline: 'IndiGo',
        airlineCode: '6E',
        origin: 'DEL',
        destination: 'BOM',
        departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        duration: 120,
        stops: 0,
      }
    ],
    passengers: [
      { firstName: 'Amit', lastName: 'Kumar', type: 'adult', gender: 'male' }
    ],
    fare: {
      baseFare: 3500,
      taxes: 650,
      totalFare: 4150,
      customerFare: 4650,
      markup: 500,
      currency: 'INR',
    },
    totalAmount: 4650,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'booking_002',
    bookingRef: 'TRV-20240308-P9L4Q2',
    bookingType: 'B2B',
    status: 'confirmed',
    pnr: 'XYZ789',
    contactEmail: 'traveller@example.com',
    contactPhone: '+91-9876511111',
    segments: [
      {
        flightNumber: 'AI-302',
        airline: 'Air India',
        airlineCode: 'AI',
        origin: 'BOM',
        destination: 'CCU',
        departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 150 * 60 * 1000).toISOString(),
        duration: 150,
        stops: 0,
      }
    ],
    passengers: [
      { firstName: 'Sunita', lastName: 'Rao', type: 'adult', gender: 'female' }
    ],
    fare: {
      baseFare: 5200,
      taxes: 900,
      totalFare: 6100,
      customerFare: 6700,
      markup: 600,
      currency: 'INR',
    },
    totalAmount: 6700,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'booking_003',
    bookingRef: 'TRV-20240301-R3M8N5',
    bookingType: 'B2B',
    status: 'cancelled',
    contactEmail: 'refund@example.com',
    contactPhone: '+91-9876522222',
    segments: [
      {
        flightNumber: 'SG-112',
        airline: 'SpiceJet',
        airlineCode: 'SG',
        origin: 'DEL',
        destination: 'GOI',
        departureTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 180 * 60 * 1000).toISOString(),
        duration: 180,
        stops: 0,
      }
    ],
    passengers: [
      { firstName: 'Deepak', lastName: 'Singh', type: 'adult', gender: 'male' }
    ],
    fare: {
      baseFare: 2800,
      taxes: 500,
      totalFare: 3300,
      customerFare: 3800,
      markup: 500,
      currency: 'INR',
    },
    totalAmount: 3800,
    refundAmount: 3420,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ── KYC ────────────────────────────────────────────────────────────────────
export const MOCK_KYC = {
  _id: 'kyc_mock_001',
  agentId: 'agent_mock_001',
  status: 'approved',
  businessType: 'pvt_ltd',
  gstNumber: '27AAPCS1751H1Z4',
  panNumber: 'AAPCS1751H',
  documents: {
    gstCertificate: 'gst_cert_url',
    panCard: 'pan_card_url',
    bankStatement: 'bank_stmt_url',
  },
  submittedAt: '2024-01-20T10:00:00Z',
  approvedAt: '2024-01-22T14:30:00Z',
  adminNote: 'All documents verified',
}

// ── Admin Stats ────────────────────────────────────────────────────────────
export const MOCK_ADMIN_STATS = {
  totalAgents: 128,
  activeAgents: 114,
  pendingKyc: 8,
  totalCustomers: 3420,
  totalBookings: 15680,
  totalRevenue: 48500000,
  todayBookings: 34,
  todayRevenue: 285000,
  monthlyRevenue: [
    { month: 'Sep', revenue: 3200000 },
    { month: 'Oct', revenue: 3850000 },
    { month: 'Nov', revenue: 4100000 },
    { month: 'Dec', revenue: 5200000 },
    { month: 'Jan', revenue: 4600000 },
    { month: 'Feb', revenue: 4900000 },
    { month: 'Mar', revenue: 5100000 },
  ],
  topRoutes: [
    { route: 'DEL-BOM', bookings: 1240, revenue: 5750000 },
    { route: 'BOM-DEL', bookings: 1180, revenue: 5450000 },
    { route: 'DEL-BLR', bookings: 980, revenue: 4200000 },
    { route: 'BOM-CCU', bookings: 760, revenue: 3800000 },
    { route: 'DEL-HYD', bookings: 640, revenue: 2950000 },
  ],
  recentBookings: MOCK_BOOKINGS,
}

// ── Insurance Plans ────────────────────────────────────────────────────────
export const MOCK_INSURANCE_PLANS = [
  {
    planId: 'plan_basic',
    planType: 'domestic_basic',
    planName: 'Basic Cover',
    provider: 'Bajaj Allianz',
    premium: 199,
    totalPremium: 199,
    coverage: {
      tripCancellation: 10000,
      medicalExpenses: 100000,
      baggageLoss: 5000,
    },
    features: ['Trip Cancellation', 'Medical Cover', 'Baggage Loss'],
    recommended: false,
  },
  {
    planId: 'plan_standard',
    planType: 'domestic_standard',
    planName: 'Standard Cover',
    provider: 'Bajaj Allianz',
    premium: 349,
    totalPremium: 349,
    coverage: {
      tripCancellation: 25000,
      medicalExpenses: 250000,
      baggageLoss: 15000,
      flightDelay: 5000,
    },
    features: ['Trip Cancellation', 'Medical Cover', 'Baggage Loss', 'Flight Delay'],
    recommended: true,
  },
  {
    planId: 'plan_premium',
    planType: 'domestic_premium',
    planName: 'Premium Cover',
    provider: 'Bajaj Allianz',
    premium: 599,
    totalPremium: 599,
    coverage: {
      tripCancellation: 50000,
      medicalExpenses: 500000,
      baggageLoss: 25000,
      flightDelay: 10000,
      missedConnection: 15000,
    },
    features: ['Trip Cancellation', 'Medical Cover', 'Baggage Loss', 'Flight Delay', 'Missed Connection'],
    recommended: false,
  },
]

// ── Commissions ────────────────────────────────────────────────────────────
export const MOCK_COMMISSIONS = [
  {
    _id: 'comm_001',
    bookingRef: 'TRV-20240310-X7K2M1',
    amount: 500,
    percentage: 2.5,
    status: 'paid',
    paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'comm_002',
    bookingRef: 'TRV-20240308-P9L4Q2',
    amount: 600,
    percentage: 2.5,
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ── Report ─────────────────────────────────────────────────────────────────
export const MOCK_REPORT = {
  totalBookings: 234,
  confirmedBookings: 220,
  cancelledBookings: 14,
  totalRevenue: 3850000,
  totalCommissions: 96250,
  walletBalance: 125000,
  period: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date().toISOString(),
  },
  bookingsByMonth: [
    { month: 'Jan', bookings: 18, revenue: 290000 },
    { month: 'Feb', bookings: 22, revenue: 355000 },
    { month: 'Mar', bookings: 31, revenue: 498000 },
  ],
}

// ── Agents List (for Admin) ────────────────────────────────────────────────
export const MOCK_AGENTS_LIST = [
  {
    _id: 'agent_mock_001',
    agentId: 'AG20240001',
    agencyName: 'Sunrise Travels Pvt Ltd',
    contactPerson: 'Rajesh Sharma',
    email: 'rajesh@sunrisetravels.in',
    phone: '+91-9876543210',
    city: 'Mumbai',
    state: 'Maharashtra',
    kycStatus: 'approved',
    status: 'active',
    walletBalance: 125000,
    totalBookings: 234,
    totalRevenue: 3850000,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    _id: 'agent_mock_002',
    agentId: 'AG20240002',
    agencyName: 'Blue Sky Tours',
    contactPerson: 'Anil Verma',
    email: 'anil@blueskytours.in',
    phone: '+91-9876544321',
    city: 'Delhi',
    state: 'Delhi',
    kycStatus: 'approved',
    status: 'active',
    walletBalance: 85000,
    totalBookings: 178,
    totalRevenue: 2920000,
    createdAt: '2024-02-01T09:00:00Z',
  },
  {
    _id: 'agent_mock_003',
    agentId: 'AG20240003',
    agencyName: 'Horizon Travel Agency',
    contactPerson: 'Meena Pillai',
    email: 'meena@horizontravel.in',
    phone: '+91-9876555678',
    city: 'Bangalore',
    state: 'Karnataka',
    kycStatus: 'submitted',
    status: 'inactive',
    walletBalance: 0,
    totalBookings: 0,
    totalRevenue: 0,
    createdAt: '2024-03-05T11:00:00Z',
  },
  {
    _id: 'agent_mock_004',
    agentId: 'AG20240004',
    agencyName: 'Pearl Vacations',
    contactPerson: 'Suresh Nair',
    email: 'suresh@pearlvacations.in',
    phone: '+91-9876566789',
    city: 'Chennai',
    state: 'Tamil Nadu',
    kycStatus: 'approved',
    status: 'suspended',
    walletBalance: 12000,
    totalBookings: 45,
    totalRevenue: 720000,
    createdAt: '2024-01-28T08:00:00Z',
  },
]

// ── Customers List (for Admin) ─────────────────────────────────────────────
export const MOCK_CUSTOMERS_LIST = [
  {
    _id: 'customer_mock_001',
    firstName: 'Priya',
    lastName: 'Mehta',
    email: 'priya.mehta@gmail.com',
    phone: '+91-9876512345',
    totalBookings: 8,
    loyaltyPoints: 1250,
    loyaltyTier: 'silver',
    createdAt: '2024-03-20T08:00:00Z',
  },
  {
    _id: 'customer_mock_002',
    firstName: 'Arjun',
    lastName: 'Patel',
    email: 'arjun.patel@gmail.com',
    phone: '+91-9876523456',
    totalBookings: 15,
    loyaltyPoints: 3800,
    loyaltyTier: 'gold',
    createdAt: '2024-02-10T10:00:00Z',
  },
  {
    _id: 'customer_mock_003',
    firstName: 'Kavita',
    lastName: 'Reddy',
    email: 'kavita.reddy@yahoo.in',
    phone: '+91-9876534567',
    totalBookings: 3,
    loyaltyPoints: 450,
    loyaltyTier: 'bronze',
    createdAt: '2024-04-01T14:00:00Z',
  },
]

// ── Flight Search Results ──────────────────────────────────────────────────
export const MOCK_FLIGHTS = (origin: string, destination: string, date?: string) => {
  const airlines = [
    { code: '6E', name: 'IndiGo', logo: '✈️' },
    { code: 'AI', name: 'Air India', logo: '✈️' },
    { code: 'SG', name: 'SpiceJet', logo: '✈️' },
    { code: 'UK', name: 'Vistara', logo: '✈️' },
    { code: 'G8', name: 'Go First', logo: '✈️' },
  ]

  const travelDate = date ? new Date(date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return airlines.map((airline, i) => {
    const depHour = 6 + i * 3
    const duration = Math.floor(90 + Math.random() * 90)
    const departure = new Date(travelDate)
    departure.setHours(depHour, Math.floor(Math.random() * 60), 0, 0)
    const arrival = new Date(departure.getTime() + duration * 60 * 1000)

    const baseFare = Math.floor(2500 + Math.random() * 5000)
    const taxes = Math.floor(baseFare * 0.18)
    const totalFare = baseFare + taxes

    return {
      resultToken: `mock_token_${airline.code}_${Date.now()}_${i}`,
      flightNumber: `${airline.code}-${100 + i * 57}`,
      airline: airline.name,
      airlineCode: airline.code,
      origin: origin?.toUpperCase() || 'DEL',
      destination: destination?.toUpperCase() || 'BOM',
      departureTime: departure.toISOString(),
      arrivalTime: arrival.toISOString(),
      duration,
      stops: i === 2 ? 1 : 0,   // SpiceJet has 1 stop
      stopDetails: i === 2 ? [{ airport: 'HYD', duration: 60 }] : [],
      cabinClass: 'Economy',
      seatsAvailable: Math.floor(3 + Math.random() * 15),
      fare: {
        baseFare,
        taxes,
        otherCharges: 0,
        totalFare,
        currency: 'INR',
      },
      baggageInfo: {
        checkIn: `${15 + (i % 2) * 8} kg`,
        cabin: '7 kg',
      },
      amenities: {
        meal: i === 1 || i === 3,
        wifi: i === 3,
        entertainment: i === 1,
      },
      refundable: i !== 4,
    }
  })
}
