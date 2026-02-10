import { CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Since this is a public page, we use a client component or server component with admin client?
// Ideally, we should fetch data server-side.
// We need to fetch booking details. RLS might block if we are not authenticated.
// So we probably need to use a service role client or expose a public endpoint.
// For now, let's assume we can fetch basic details if we have the ID, or maybe we need a token?
// The booking confirmation usually happens after payment, so maybe we can show details.
// BUT, RLS usually requires tenant_id. 
// If this is a public page, we might need a way to bypass RLS or use a secure token.
// However, typically confirmation pages are transient or public but obfuscated.
// Let's assume for now we use the ID and fetch what we can. 
// If RLS blocks, we might need to adjust. 
// Actually, `bookings` table has RLS.
// We might need to make a server action or API route that verifies the booking ID and returns details without auth if it's a confirmation flow.
// Or simpler: The user just paid, so maybe they have a cookie? No, they might be on a different device.
// Let's use `getSupabaseAdmin` (if available) or similar for this specific page, OR simpler:
// Just show a static "Thank you" and fetch status client side? 
// Let's try to fetch server side with admin access for just this read, strictly scoped.

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// We need a way to read booking without user session.
// DANGER: Using service role key in a server component is okay if we are careful.
// But we should verify the booking belongs to a tenant.

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*, listings(name, tenant_id), tenants(business_type, is_branding_enabled)")
    .eq("id", id)
    .single();

  if (error || !booking) {
    return notFound();
  }

  const tenant = booking.tenants;
  const listing = booking.listings;

  // Determine Branding Text
  let brandingText = "Powered by Nodebase AI";
  if (tenant?.is_branding_enabled) {
     switch (tenant.business_type) {
        case 'kirana_store':
        case 'thrift_store':
          brandingText = "This store uses Nodebase AI";
          break;
        case 'doctor_clinic':
          brandingText = "Automated by Nodebase";
          break;
        case 'airbnb_host':
        default:
          brandingText = "Powered by Nodebase AI";
          break;
     }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          {booking.status === 'confirmed' || booking.status === 'payment_pending' ? (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          ) : (
             <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {booking.status === 'confirmed' ? 'Booking Confirmed!' : 'Booking Received'}
          </h1>
          <p className="text-gray-600 mb-8">
            {booking.status === 'confirmed' 
              ? `Your booking at ${listing?.name} is confirmed.` 
              : `We have received your request for ${listing?.name}. Check your email for updates.`}
          </p>

          <div className="border-t border-gray-100 pt-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium text-gray-900">₹{booking.amount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Check-in</span>
              <span className="font-medium text-gray-900">{new Date(booking.start_date).toLocaleDateString()}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-gray-500">Check-out</span>
              <span className="font-medium text-gray-900">{new Date(booking.end_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* Contextual Branding Footer */}
        {tenant?.is_branding_enabled && (
           <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
             <p className="text-xs text-gray-400 font-medium">
               {brandingText}
             </p>
           </div>
        )}
      </div>
    </div>
  );
}
