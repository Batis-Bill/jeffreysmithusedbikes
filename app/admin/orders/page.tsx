import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    profile.role !== "admin" ||
    profile.is_active !== true
  ) {
    redirect("/admin/login");
  }

  const adminSupabase = createAdminClient();

  const { data: orders, error } = await adminSupabase
    .from("orders")
    .select(`
      id,
      order_number,
      bike_id,
      customer_name,
      customer_email,
      customer_phone,
      bike_price_cents,
      payment_method,
      payment_status,
      order_status,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Orders error:", error);
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Jeffrey Smith Used Bikes
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Orders
            </h1>

            <p className="mt-2 text-slate-400">
              Review customer orders and payment status.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-5 py-4">Order #</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Payment Method</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4">Order Status</th>
                    <th className="px-5 py-4">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-5 py-4 font-semibold">
                        <Link
                            href={`/admin/orders/${order.id}`}
                            className='text-orange-400 hover : text-orange-300'
                        >
                            {order.order_number}    
                        </Link>
                        
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          {order.customer_name}
                        </p>

                        <p className="text-sm text-slate-400">
                          {order.customer_email}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-orange-400">
                        $
                        {(order.bike_price_cents / 100).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>

                      <td className="px-5 py-4 capitalize">
                        {order.payment_method.replaceAll("_", " ")}
                      </td>

                      <td className="px-5 py-4 capitalize">
                        {order.payment_status.replaceAll("_", " ")}
                      </td>

                      <td className="px-5 py-4 capitalize">
                        {order.order_status.replaceAll("_", " ")}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <h2 className="text-xl font-bold">
                No orders yet
              </h2>

              <p className="mt-2 text-slate-400">
                Customer orders will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}