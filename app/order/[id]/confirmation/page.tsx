import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { id } = await params;
  const { order: orderId } = await searchParams;

  if (!orderId) {
    notFound();
  }

  const adminSupabase = createAdminClient();

  const { data: order, error } = await adminSupabase
    .from("orders")
    .select(`
      id,
      order_number,
      bike_id,
      customer_name,
      customer_email,
      payment_method,
      payment_status,
      order_status,
      bike_price_cents,
      created_at
    `)
    .eq("id", orderId)
    .eq("bike_id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            Order Created
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Your order request has been received
          </h1>

          <p className="mt-4 text-slate-400">
            Your request is currently awaiting payment. Do not send money
            until the payment instructions and motorcycle details have been
            verified.
          </p>

          <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div>
              <p className="text-xs text-slate-500">
                Order Number
              </p>
              <p className="mt-1 font-semibold">
                {order.order_number}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Customer
              </p>
              <p className="mt-1 font-semibold">
                {order.customer_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Email
              </p>
              <p className="mt-1 font-semibold">
                {order.customer_email}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Amount
              </p>
              <p className="mt-1 font-semibold text-orange-400">
                $
                {(order.bike_price_cents / 100).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Preferred Payment Method
              </p>
              <p className="mt-1 font-semibold capitalize">
                {order.payment_method.replaceAll("_", " ")}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Payment Status
              </p>
              <p className="mt-1 font-semibold capitalize">
                {order.payment_status.replaceAll("_", " ")}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-100">
            This page does not mean the motorcycle is paid for or reserved.
            Payment must be completed through the secure payment step we add next.
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
            >
              Back to Shop
            </Link>

            <Link
              href={`/bikes/${id}`}
              className="rounded-xl bg-orange-500 px-5 py-3 font-bold transition hover:bg-orange-400"
            >
              View Bike
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}