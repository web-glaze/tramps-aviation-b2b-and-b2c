import apiClient, { USE_MOCK } from './client'
import {
  MOCK_FLIGHTS, MOCK_AGENT, MOCK_CUSTOMER,
  MOCK_WALLET, MOCK_TRANSACTIONS, MOCK_BOOKINGS, MOCK_KYC,
  MOCK_INSURANCE_PLANS, MOCK_COMMISSIONS,
  MOCK_REPORT,
  delay
} from './mock'

const mock = async (data: any, ms = 600) => { await delay(ms); return { data } }

// ─────────────────────────────────────────────────────────────────────
// RESPONSE NORMALIZERS
// Backend wraps responses as { message, data: { ... } }
// These helpers unwrap cleanly so every page gets flat data
// ─────────────────────────────────────────────────────────────────────
export const unwrap      = (res: any) => res?.data?.data ?? res?.data ?? res
export const extractToken = (res: any): string => { const d = unwrap(res); return d?.access_token || d?.token || '' }
export const extractAgent = (res: any) => { const d = unwrap(res); return d?.agent || d }
export const extractUser  = (res: any) => { const d = unwrap(res); return d?.user  || d }

// ═════════════════════════════════════════════════════════════════════
// AUTH
// ═════════════════════════════════════════════════════════════════════
export const authApi = {
  registerAgent: (data: any) => USE_MOCK
    ? mock({ data: { access_token: 'mock-jwt-agent', agent: { ...MOCK_AGENT, ...data } }, message: 'Registration successful.' }, 800)
    : apiClient.post('/agents/register', data),

  loginAgent: (data: { email: string; password: string }) => USE_MOCK
    ? mock({ data: { access_token: 'mock-jwt-agent', agent: { ...MOCK_AGENT, email: data.email } } }, 600)
    : apiClient.post('/agents/login', data),

  forgotPassword: (data: any) => USE_MOCK
    ? mock({ message: 'OTP sent' }, 500)
    : apiClient.post('/agents/forgot-password', data),

  resetPassword: (data: any) => USE_MOCK
    ? mock({ message: 'Password reset successfully' }, 500)
    : apiClient.post('/agents/reset-password', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) => USE_MOCK
    ? mock({ message: 'Password changed successfully' }, 500)
    : apiClient.post('/agents/change-password', data),

  registerCustomer: (data: any) => USE_MOCK
    ? mock({ data: { access_token: 'mock-jwt-customer', user: { ...MOCK_CUSTOMER, ...data } } }, 700)
    : apiClient.post('/auth/customer/register', data),

  loginCustomer: (data: { email: string; password: string }) => USE_MOCK
    ? mock({ data: { access_token: 'mock-jwt-customer', user: { ...MOCK_CUSTOMER, email: data.email } } }, 600)
    : apiClient.post('/auth/customer/login', data),

  sendOtp: (phoneNumber: string) => USE_MOCK
    ? mock({ message: 'OTP sent', otp: '123456' }, 500)
    : apiClient.post('/auth/otp/send', { phoneNumber, provider: 'sms' }),

  verifyOtp: (phoneNumber: string, otp: string) => USE_MOCK
    ? mock({ data: { access_token: 'mock-jwt-customer', user: { ...MOCK_CUSTOMER, phone: phoneNumber } } }, 600)
    : apiClient.post('/auth/otp/verify', { phoneNumber, otp }),

  resendOtp: (phoneNumber: string) => USE_MOCK
    ? mock({ message: 'OTP resent', otp: '123456' }, 500)
    : apiClient.post('/auth/otp/resend', { phoneNumber, provider: 'sms' }),

  me: () => USE_MOCK ? mock(MOCK_AGENT) : apiClient.get('/auth/me'),
}

// ═════════════════════════════════════════════════════════════════════
// AGENT (B2B)
// ═════════════════════════════════════════════════════════════════════
export const agentApi = {
  getProfile:    ()       => USE_MOCK ? mock({ ...MOCK_AGENT }) : apiClient.get('/agents/profile'),
  updateProfile: (d: any) => USE_MOCK ? mock({ ...MOCK_AGENT, ...d }) : apiClient.put('/agents/profile', d),

  getKycStatus: () => USE_MOCK
    ? mock({ kycStatus: MOCK_KYC.status, kycDocuments: [], ...MOCK_KYC }, 400)
    : apiClient.get('/agents/kyc/status'),

  uploadKycDocument: (docType: string, file: File) => {
    const fd = new FormData(); fd.append('document', file); fd.append('docType', docType)
    return apiClient.post('/agents/kyc/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  submitKyc: (data: any) => USE_MOCK
    ? mock({ message: 'KYC submitted successfully', kycStatus: 'submitted' }, 800)
    : apiClient.post('/kyc/submit', data),

  getWallet:            ()        => USE_MOCK ? mock({ balance: MOCK_WALLET.balance || 10000, currency: 'INR' }) : apiClient.get('/agents/wallet/balance'),
  getWalletTransactions:(params?: any) => USE_MOCK ? mock({ transactions: MOCK_TRANSACTIONS, pagination: { total: MOCK_TRANSACTIONS.length, page: 1, limit: 20, totalPages: 1 } }) : apiClient.get('/agents/wallet/transactions', { params }),

  getBookings:    (params?: any) => USE_MOCK ? mock({ data: MOCK_BOOKINGS, pagination: { total: MOCK_BOOKINGS.length, page: 1, limit: 20 } }) : apiClient.get('/bookings/my', { params }),
  getBookingById: (id: string)   => USE_MOCK ? mock({ booking: MOCK_BOOKINGS.find((b: any) => b._id === id) || MOCK_BOOKINGS[0] }) : apiClient.get(`/bookings/${id}`),
  cancelBooking:  (id: string)   => USE_MOCK ? mock({ message: 'Booking cancelled', penalty: 500 }, 600) : apiClient.patch(`/bookings/${id}/cancel`),

  bookFlight: async (data: any) => {
    if (USE_MOCK) {
      await delay(1200)
      const ref = 'TP' + Date.now().toString().slice(-7)
      const pnr = Math.random().toString(36).substring(2, 8).toUpperCase()
      return { data: { booking: { bookingRef: ref, pnr, status: 'confirmed', ticketNumber: 'TK' + pnr }, message: 'Flight booked successfully!' } }
    }
    return apiClient.post('/bookings/agent/flight', data)
  },

  getDashboard:       ()        => USE_MOCK ? mock({ walletBalance: 10000, totalBookings: 24, totalRevenue: 284000, kycStatus: 'approved', agencyName: 'Demo Agency' }) : apiClient.get('/agents/dashboard'),
  getCommissions:     (p?: any) => USE_MOCK ? mock({ report: MOCK_REPORT, commissions: MOCK_COMMISSIONS }) : apiClient.get('/reports/agent/summary', { params: p }),
  getWalletStatement: (p?: any) => USE_MOCK ? mock({ transactions: MOCK_TRANSACTIONS }) : apiClient.get('/reports/agent/wallet-statement', { params: p }),
}

// ═════════════════════════════════════════════════════════════════════
// CUSTOMER (B2C)
// ═════════════════════════════════════════════════════════════════════
export const customerApi = {
  getProfile:      ()        => USE_MOCK ? mock({ user: MOCK_CUSTOMER }) : apiClient.get('/customer/profile'),
  getBookings:     (p?: any) => USE_MOCK ? mock({ bookings: MOCK_BOOKINGS }) : apiClient.get('/bookings/my', { params: p }),
  cancelBooking:   (id: string) => USE_MOCK ? mock({ message: 'Cancelled' }) : apiClient.patch(`/bookings/${id}/cancel`),
  requestRefund:   (data: any) => USE_MOCK ? mock({ message: 'Refund requested' }) : apiClient.post('/refunds/request', data),
  getRefunds:      ()        => USE_MOCK ? mock({ refunds: [] }) : apiClient.get('/refunds/my'),
  initiateBooking: async (data: any) => {
    if (USE_MOCK) { await delay(800); const id = 'bk' + Date.now(); return { data: { bookingId: id, amount: data.totalAmount || 3850, paymentRequired: true } } }
    return apiClient.post('/bookings/customer/flight/initiate', data)
  },
}

// ═════════════════════════════════════════════════════════════════════
// SEARCH (Public)
// ═════════════════════════════════════════════════════════════════════
export const searchApi = {
  searchFlights: async (data: any) => {
    if (USE_MOCK) {
      await delay(800)
      const flights = MOCK_FLIGHTS(data.origin, data.destination, data.date)
      return { data: { flights, total: flights.length } }
    }
    const payload = {
      origin: data.origin, destination: data.destination,
      departureDate: data.departureDate || data.date,
      adults: data.adults || data.passengers || 1,
      children: data.children || 0, infants: data.infants || 0,
      cabinClass: data.cabinClass || 'ECONOMY',
      returnDate: data.returnDate, tripType: data.tripType,
    }
    const res = await apiClient.post('/search/flights', payload)
    const raw = res.data as any
    const flights = (raw.flights || raw.results || raw.data?.flights || []).map((f: any) => ({
      ...f,
      flightKey:     f.flightKey     || f.resultToken || f.id,
      departureTime: f.departureTime || (f.departure ? f.departure.split('T')[1]?.slice(0,5) : ''),
      arrivalTime:   f.arrivalTime   || (f.arrival   ? f.arrival.split('T')[1]?.slice(0,5)   : ''),
      fare: { ...(f.fare || {}), baseFare: f.fare?.baseFare || 0, taxes: f.fare?.taxes || 0, totalFare: f.fare?.totalFare || f.fare?.total || f.price || 0, total: f.fare?.total || f.fare?.totalFare || f.price || 0, currency: f.fare?.currency || 'INR' },
    }))
    return { data: { flights, totalCount: flights.length, source: raw.source || 'API' } }
  },
  revalidateFlight: (data: any) => USE_MOCK ? mock({ valid: true, flight: data.flightData }, 400) : apiClient.post('/search/flights/revalidate', data),
  searchInsurance:  (data: any) => USE_MOCK ? mock({ plans: MOCK_INSURANCE_PLANS }, 500) : apiClient.post('/search/insurance/plans', data),
}

// ═════════════════════════════════════════════════════════════════════
// FLIGHTS (B2C normalized)
// ═════════════════════════════════════════════════════════════════════
export const flightsApi = {
  search: async (data: any) => {
    const res = await searchApi.searchFlights(data)
    const raw = res.data as any
    const flights = (raw.flights || []).map((f: any) => ({
      ...f,
      id: f.id || f.flightKey || f.resultToken,
      flightNo: f.flightNo || f.flightNumber,
      from: f.from || f.origin, to: f.to || f.destination,
      departure: f.departureTime || (f.departure ? (f.departure.includes('T') ? f.departure.split('T')[1].slice(0,5) : f.departure) : ''),
      arrival:   f.arrivalTime   || (f.arrival   ? (f.arrival.includes('T')   ? f.arrival.split('T')[1].slice(0,5)   : f.arrival)   : ''),
      price: f.price || f.fare?.total || f.fare?.totalFare || 0,
      refundable: f.refundable || f.isRefundable || false,
    }))
    return { data: { flights, totalCount: flights.length } }
  },
  revalidate: (data: any) => searchApi.revalidateFlight(data),
}

// ═════════════════════════════════════════════════════════════════════
// HOTELS
// ═════════════════════════════════════════════════════════════════════
export const hotelsApi = {
  searchCities: async (query: string) => {
    try {
      const res = await apiClient.get('/search/hotels/cities', { params: { q: query } })
      return res.data
    } catch {
      const CITIES = ['Delhi','Mumbai','Bangalore','Chennai','Kolkata','Hyderabad','Goa','Jaipur','Pune','Ahmedabad','Kochi','Chandigarh']
      return CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase())).map(c => ({ code: c.toUpperCase().slice(0,3), name: c, country: 'IN' }))
    }
  },
  search: async (data: any) => {
    try {
      const res = await apiClient.post('/search/hotels', data)
      const raw = res.data as any
      const hotels = (raw.hotels || raw.results || []).map((h: any) => ({
        id: h.id || h.hotelId || h.resultToken, name: h.name || h.HotelName || 'Hotel',
        city: h.city || h.City || data.cityCode || '', stars: h.stars || h.StarRating || 3,
        price: h.price?.grandTotal || h.price?.total || h.TotalFare || h.price || 0,
        pricePerNight: h.price?.perNight || h.pricePerNight || 0,
        rating: h.rating || (3.5 + Math.random() * 1.4).toFixed(1),
        reviews: h.reviews || Math.floor(200 + Math.random() * 2000),
        amenities: h.amenities || [], image: h.image || '🏨',
        resultToken: h.resultToken || h.id || h.hotelId,
        cancellation: h.cancellation || 'CHECK_POLICY', mealPlan: h.mealPlan || 'ROOM_ONLY',
      }))
      return { data: { hotels, totalCount: hotels.length } }
    } catch { return { data: { hotels: [], totalCount: 0 } } }
  },
  getDetails: (hotelCode: string, params: any) => apiClient.get(`/hotels/${hotelCode}`, { params }),
  book: (data: any) => apiClient.post('/hotels/book', data),
}

// ═════════════════════════════════════════════════════════════════════
// INSURANCE
// ═════════════════════════════════════════════════════════════════════
export const insuranceApi = {
  getPlans:     (data: any) => searchApi.searchInsurance(data),
  buyPlan:      (data: any) => apiClient.post('/insurance/buy', data),
  getMyPolicies: ()         => apiClient.get('/insurance/my-policies'),
}

// ═════════════════════════════════════════════════════════════════════
// PAYMENT
// ═════════════════════════════════════════════════════════════════════
export const paymentApi = {
  createOrder: (data: { bookingId: string; amount: number }) => USE_MOCK
    ? mock({ orderId: 'order_mock_' + Date.now(), amount: data.amount, currency: 'INR', key: 'rzp_test_mock' }, 500)
    : apiClient.post('/payment/create-order', data),
  verifyPayment: (data: any) => USE_MOCK
    ? mock({ success: true, message: 'Payment verified' }, 600)
    : apiClient.post('/payment/verify', data),
}

// ── Legacy stubs ──────────────────────────────────────────────────────
export const statsApi = { getStats: () => apiClient.get('/api/stats') }

export const usersApi = {
  getUsers:   (params?: any) => apiClient.get('/api/users', { params }),
  getAll:     (params?: any) => apiClient.get('/api/users', { params }),
  getUser:    (id: string)   => apiClient.get(`/api/users/${id}`),
  getById:    (id: string)   => apiClient.get(`/api/users/${id}`),
  create:     (data: any)    => apiClient.post('/api/users', data),
  update:     (id: string, data: any) => apiClient.put(`/api/users/${id}`, data),
  updateUser: (id: string, data: any) => apiClient.put(`/api/users/${id}`, data),
  delete:     (id: string)   => apiClient.delete(`/api/users/${id}`),
  deleteUser: (id: string)   => apiClient.delete(`/api/users/${id}`),
}

// ─────────────────────────────────────────────────────────────────────
// ALIASES — backward compat for pages that still use these names
// ─────────────────────────────────────────────────────────────────────
// authApi.loginWithEmail / loginWithOtp used by b2c/login
;(authApi as any).loginWithEmail = (email: string, password: string) =>
  authApi.loginCustomer({ email, password })
;(authApi as any).loginWithOtp = (phone: string, otp: string) =>
  authApi.verifyOtp(phone, otp)
