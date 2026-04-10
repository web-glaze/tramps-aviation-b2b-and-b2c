import { redirect } from 'next/navigation';

export default function SearchRedirectPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; date?: string; adults?: string };
}) {
  const params = new URLSearchParams();
  if (searchParams.from)   params.set('from',   searchParams.from);
  if (searchParams.to)     params.set('to',     searchParams.to);
  if (searchParams.date)   params.set('date',   searchParams.date);
  if (searchParams.adults) params.set('adults', searchParams.adults);

  const qs = params.toString();
  // Redirect directly to common /flights (not /b2c/flights which gets redirected again)
  redirect(`/flights${qs ? '?' + qs : ''}`);
}
