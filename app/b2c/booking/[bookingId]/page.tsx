import { redirect } from 'next/navigation'

/**
 * /b2c/booking/[bookingId] — Redirects to the common /booking/[bookingId] page.
 * The common page is identical and works for both B2B and B2C bookings.
 */
export default function B2CBookingRedirect({
  params,
}: {
  params: { bookingId: string }
}) {
  redirect(`/booking/${params.bookingId}`)
}
