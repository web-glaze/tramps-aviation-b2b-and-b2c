import apiClient, { USE_MOCK } from './client'
import {
  MOCK_FLIGHTS, MOCK_AGENT, MOCK_CUSTOMER,
  MOCK_WALLET, MOCK_TRANSACTIONS, MOCK_BOOKINGS, MOCK_KYC,
  MOCK_INSURANCE_PLANS, MOCK_COMMISSIONS,
  MOCK_REPORT,
  delay
} from './mock'

// ── Helper: mock response wrapper ──────────────────────────────────────
const mock = async (data: any, ms = 600) => {
  await delay(ms)
  return { data }
}

// ══════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════
export const authApi = {
  // B2B Agent
  registerAgent: async (data: any) => {
    if (USE_MOCK) {
      await delay(800)
      return { data: { access_token: 'mock-jwt-agent', agent: { ...MOCK_AGENT, ...data }, message: 'Registration successful.' } }
    }
    return apiClient.post('/agents/register', data)
  },

  loginAgent: async (data: { email: string; password: string }) => {
    if (USE_MOCK) {
      await delay(600)
      return { data: { access_token: 'mock-jwt-agent', agent: { ...MOCK_AGENT, email: data.email } } }
    }
    return apiClient.post('/agents/login', data)
  },

  forgotPassword: async (data: any) => {
    if (USE_MOCK) { await delay(500); return { data: { message: 'OTP sent' } } }
    return apiClient.post('/agents/forgot-password', data)
  },

  resetPassword: async (data: any) => {
    if (USE_MOCK) { await delay(500); return { data: { message: 'Password reset successfully' } } }
    return apiClient.post('/agents/reset-password', data)
  },

  // B2C Customer
  registerCustomer: async (data: any) => {
    if (USE_MOCK) {
      await delay(700)
      return { data: { access_token: 'mock-jwt-customer', user: { ...MOCK_CUSTOMER, ...data } } }
    }
    return apiClient.post('/auth/customer/register', data)
  },

  loginCustomer: async (data: { email: string; password: string }) => {
    if (USE_MOCK) {
      await delay(600)
      return { data: { access_token: 'mock-jwt-customer', user: { ...MOCK_CUSTOMER, email: data.email } } }
    }
    return apiClient.post('/auth/customer/login', data)
  },

  loginWithEmail: async (email: string, password: string) => {
    if (USE_MOCK) {
      await delay(600)
      return { data: { token: 'mock-jwt-customer', user: { ...MOCK_CUSTOMER, email } } }
    }
    const res = await apiClient.post('/auth/customer/login', { email, password })
    const d = res.data as any
    if (d.token && !d.access_token) d.access_token = d.token
    return res
  },

  sendOtp: async (phone: string) => {
    if (USE_MOCK) { await delay(500); return { data: { message: 'OTP sent' } } }
    return apiClient.post('/auth/otp/send', { phone })
  },

  loginWithOtp: async (phone: string, otp: string) => {
    if (USE_MOCK) {
      await delay(600)
      return { data: { token: 'mock-jwt-customer', user: { ...MOCK_CUSTOMER, phone } } }
    }
    return apiClient.post('/auth/otp/verify', { phone, otp })
  },

  me: () => USE_MOCK ? mock(MOCK_AGENT) : apiClient.get('/auth/me'),
}

// ══════════════════════════════════════════════════════════════════════
// AGENT (B2B)
// ══════════════════════════════════════════════════════════════════════
export const agentApi = {
  getProfile: () => USE_MOCK ? mock({ ...MOCK_AGENT }) : apiClient.get('/agents/profile'),
  updateProfile: (d: any) => USE_MOCK ? mock({ ...MOCK_AGENT, ...d }) : apiClient.put('/agents/profile', d),

  submitKyc: async (data: any) => {
    if (USE_MOCK) { await delay(800); return { data: { message: 'KYC submitted successfully', kycStatus: 'submitted' } } }
    return apiClient.post('/kyc/submit', data)
  },
  getKycStatus: async () => {
    if (USE_MOCK) { await delay(400); return { data: { kycStatus: MOCK_KYC.status, kycDocuments: [], ...MOCK_KYC } } }
    return apiClient.get('/agents/kyc/status')
  },

  getWallet: () => USE_MOCK ? mock({ balance: MOCK_WALLET.balance || 10000, currency: 'INR' }) : apiClient.get('/agents/wallet/balance'),
  getWalletTransactions: (params?: any) =>
    USE_MOCK ? mock({ transactions: MOCK_TRANSACTIONS, pagination: { total: MOCK_TRANSACTIONS.length, page: 1, limit: 20, totalPages: 1 } }) : apiClient.get('/agents/wallet/transactions', { params }),

  getBookings: (params?: any) =>
    USE_MOCK ? mock({ data: MOCK_BOOKINGS, pagination: { total: MOCK_BOOKINGS.length, page: 1, limit: 20 } }) : apiClient.get('/bookings/my', { params }),

  bookFlight: async (data: any) => {
    if (USE_MOCK) {
      await delay(1200)
      const ref = 'TP' + Date.now().toString().slice(-7)
      const pnr = Math.random().toString(36).substring(2, 8).toUpperCase()
      return { data: { booking: { bookingRef: ref, pnr, status: 'confirmed', ticketNumber: 'TK' + pnr }, message: 'Flight booked successfully!' } }
    }
    return apiClient.post('/bookings/agent/flight', data)
  },

  getBookingById: (id: string) =>
    USE_MOCK ? mock({ booking: MOCK_BOOKINGS.find((b: any) => b._id === id) || MOCK_BOOKINGS[0] }) : apiClient.get(`/bookings/${id}`),

  cancelBooking: async (id: string) => {
    if (USE_MOCK) { await delay(600); return { data: { message: 'Booking cancelled', penalty: 500 } } }
    return apiClient.patch(`/bookings/${id}/cancel`)
  },

  getDashboard: () => USE_MOCK ? mock({ walletBalance: 10000, totalBookings: 24, totalRevenue: 284000, kycStatus: 'approved', agencyName: 'Demo Agency' }) : apiClient.get('/agents/dashboard'),

  getCommissions: (params?: any) =>
    USE_MOCK ? mock({ report: MOCK_REPORT, commissions: MOCK_COMMISSIONS }) : apiClient.get('/reports/agent/summary', { params }),
  getWalletStatement: (params?: any) =>
    USE_MOCK ? mock({ transactions: MOCK_TRANSACTIONS }) : apiClient.get('/reports/agent/wallet-statement', { params }),
}

// ══════════════════════════════════════════════════════════════════════
// CUSTOMER (B2C)
// ══════════════════════════════════════════════════════════════════════
export const customerApi = {
  getProfile: () => USE_MOCK ? mock({ user: MOCK_CUSTOMER }) : apiClient.get('/customer/profile'),
  getBookings: (p?: any) => USE_MOCK ? mock({ bookings: MOCK_BOOKINGS }) : apiClient.get('/bookings/my', { params: p }),
  initiateBooking: async (data: any) => {
    if (USE_MOCK) {
      await delay(800)
      const id = 'bk' + Date.now()
      return { data: { bookingId: id, amount: data.totalAmount || 3850, paymentRequired: true } }
    }
    return apiClient.post('/bookings/customer/flight/initiate', data)
  },
  cancelBooking: (id: string) => USE_MOCK ? mock({ message: 'Cancelled' }) : apiClient.patch(`/bookings/${id}/cancel`),
  requestRefund: (data: any) => USE_MOCK ? mock({ message: 'Refund requested' }) : apiClient.post('/refunds/request', data),
  getRefunds: () => USE_MOCK ? mock({ refunds: [] }) : apiClient.get('/refunds/my'),
}

// ══════════════════════════════════════════════════════════════════════
// SEARCH (Public)
// ══════════════════════════════════════════════════════════════════════
export const searchApi = {
  searchFlights: async (data: any) => {
    if (USE_MOCK) {
      await delay(800)
      const flights = MOCK_FLIGHTS(data.origin, data.destination, data.date)
      return { data: { flights, total: flights.length } }
    }
    // Normalize field names: frontend may send 'passengers', backend expects 'adults'
    const payload = {
      origin:        data.origin,
      destination:   data.destination,
      departureDate: data.departureDate || data.date,
      adults:        data.adults || data.passengers || 1,
      children:      data.children || 0,
      infants:       data.infants  || 0,
      cabinClass:    data.cabinClass || 'ECONOMY',
      returnDate:    data.returnDate,
      tripType:      data.tripType,
    }
    const res = await apiClient.post('/search/flights', payload)
    // Normalize response: ensure flights array with correct field names
    const raw = res.data as any
    const flights = (raw.flights || raw.results || raw.data?.flights || []).map((f: any) => ({
      ...f,
      // Ensure both naming conventions work
      flightKey:     f.flightKey     || f.resultToken || f.id,
      departureTime: f.departureTime || (f.departure ? f.departure.split('T')[1]?.slice(0,5) : ''),
      arrivalTime:   f.arrivalTime   || (f.arrival   ? f.arrival.split('T')[1]?.slice(0,5)   : ''),
      fare: {
        ...(f.fare || {}),
        baseFare:  f.fare?.baseFare  || 0,
        taxes:     f.fare?.taxes     || 0,
        totalFare: f.fare?.totalFare || f.fare?.total || f.price || 0,
        total:     f.fare?.total     || f.fare?.totalFare || f.price || 0,
        currency:  f.fare?.currency  || 'INR',
      },
    }))
    return { data: { flights, totalCount: flights.length, source: raw.source || 'API' } }
  },
  revalidateFlight: async (data: any) => {
    if (USE_MOCK) { await delay(400); return { data: { valid: true, flight: data.flightData } } }
    return apiClient.post('/search/flights/revalidate', data)
  },
  searchInsurance: async (data: any) => {
    if (USE_MOCK) { await delay(500); return { data: { plans: MOCK_INSURANCE_PLANS } } }
    return apiClient.post('/search/insurance/plans', data)
  },
}

// ══════════════════════════════════════════════════════════════════════
// PAYMENT
// ══════════════════════════════════════════════════════════════════════
export const paymentApi = {
  createOrder: async (data: { bookingId: string; amount: number }) => {
    if (USE_MOCK) {
      await delay(500)
      return { data: { orderId: 'order_mock_' + Date.now(), amount: data.amount, currency: 'INR', key: 'rzp_test_mock' } }
    }
    return apiClient.post('/payment/create-order', data)
  },
  verifyPayment: async (data: any) => {
    if (USE_MOCK) { await delay(600); return { data: { success: true, message: 'Payment verified' } } }
    return apiClient.post('/payment/verify', data)
  },
}



// ── flightsApi — same as searchApi but with B2C field normalization ──────────
export const flightsApi = {
  search: async (data: any) => {
    const res = await searchApi.searchFlights(data)
    const raw = res.data as any
    // Normalize for B2C page which expects f.price, f.departure (time only), f.arrival (time only)
    const flights = (raw.flights || []).map((f: any) => ({
      ...f,
      id:          f.id          || f.flightKey || f.resultToken,
      flightNo:    f.flightNo    || f.flightNumber,
      from:        f.from        || f.origin,
      to:          f.to          || f.destination,
      departure:   f.departureTime || (f.departure ? (f.departure.includes('T') ? f.departure.split('T')[1].slice(0,5) : f.departure) : ''),
      arrival:     f.arrivalTime   || (f.arrival   ? (f.arrival.includes('T')   ? f.arrival.split('T')[1].slice(0,5)   : f.arrival)   : ''),
      price:       f.price       || f.fare?.total || f.fare?.totalFare || 0,
      refundable:  f.refundable  || f.isRefundable || false,
    }))
    return { data: { flights, totalCount: flights.length } }
  },
  revalidate: (data: any) => searchApi.revalidateFlight(data),
}

// ── Hotels API alias ──────────────────────────────────────────────────────────
export const hotelsApi = {
  searchCities: async (query: string) => {
    try {
      const res = await apiClient.get('/search/hotels/cities', { params: { q: query } })
      return res.data
    } catch {
      // Fallback city list for India
      const CITIES = ['Delhi','Mumbai','Bangalore','Chennai','Kolkata','Hyderabad','Goa','Jaipur','Pune','Ahmedabad','Kochi','Chandigarh']
      const filtered = CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
      return filtered.map(c => ({ code: c.toUpperCase().slice(0,3), name: c, country: 'IN' }))
    }
  },
  search: async (data: any) => {
    try {
      const res = await apiClient.post('/search/hotels', data)
      const raw = res.data as any
      const hotels = (raw.hotels || raw.results || []).map((h: any) => ({
        id:        h.id        || h.hotelId     || h.resultToken,
        name:      h.name      || h.HotelName   || 'Hotel',
        city:      h.city      || h.City        || data.cityCode || '',
        stars:     h.stars     || h.StarRating  || 3,
        price:     h.price?.grandTotal || h.price?.total || h.TotalFare || h.price || 0,
        pricePerNight: h.price?.perNight || h.pricePerNight || 0,
        rating:    h.rating    || (3.5 + Math.random() * 1.4).toFixed(1),
        reviews:   h.reviews   || Math.floor(200 + Math.random() * 2000),
        amenities: h.amenities || [],
        image:     h.image     || '🏨',
        resultToken: h.resultToken || h.id || h.hotelId,
        cancellation: h.cancellation || 'CHECK_POLICY',
        mealPlan:  h.mealPlan  || 'ROOM_ONLY',
      }))
      return { data: { hotels, totalCount: hotels.length } }
    } catch (err) {
      return { data: { hotels: [], totalCount: 0 } }
    }
  },
  getDetails: (hotelCode: string, params: any) =>
    apiClient.get(`/hotels/${hotelCode}`, { params }),
  book: (data: any) =>
    apiClient.post('/hotels/book', data),
}

// ── Insurance API alias ───────────────────────────────────────────────────────
export const insuranceApi = {
  getPlans: (data: any) => searchApi.searchInsurance(data),
  buyPlan: (data: any) => apiClient.post('/insurance/buy', data),
  getMyPolicies: () => apiClient.get('/insurance/my-policies'),
}

// ── Legacy stubs (used by old dashboard components) ───────────────────────────
export const statsApi = {
  getStats: () => apiClient.get('/api/stats'),
}

export const usersApi = {
  getUsers: (params?: any) => apiClient.get('/api/users', { params }),
  getAll: (params?: any) => apiClient.get('/api/users', { params }),
  getUser: (id: string) => apiClient.get(`/api/users/${id}`),
  getById: (id: string) => apiClient.get(`/api/users/${id}`),
  create: (data: any) => apiClient.post('/api/users', data),
  update: (id: string, data: any) => apiClient.put(`/api/users/${id}`, data),
  updateUser: (id: string, data: any) => apiClient.put(`/api/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/users/${id}`),
  deleteUser: (id: string) => apiClient.delete(`/api/users/${id}`),
}
