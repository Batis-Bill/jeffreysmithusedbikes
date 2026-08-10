import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const { data: order, error } = await adminSupabase
    .from("orders")
    .select(`
      id,
      order_number,
      bike_id,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      bike_price_cents,
      deposit_amount_cents,
      currency,
      payment_method,
      payment_status,
      order_status,
      customer_message,
      internal_notes,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  async function updateOrder(formData: FormData) {
    "use server";

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

    const paymentStatus = String(
      formData.get("payment_status") ?? ""
    );

    const orderStatus = String(
      formData.get("order_status") ?? ""
    );

    const internalNotes = String(
      formData.get("internal_notes") ?? ""
    ).trim();

    const allowedPaymentStatuses = [
      "pending",
      "processing",
      "paid",
      "failed",
      "cancelled",
      "refunded",
      "partially_refunded",
    ];

    const allowedOrderStatuses = [
      "pending",
      "awaiting_payment",
      "deposit_paid",
      "paid",
      "processing",
      "ready_for_collection",
      "shipped",
      "completed",
      "cancelled",
      "refunded",
    ];

    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      throw new Error("Invalid payment status.");
    }

    if (!allowedOrderStatuses.includes(orderStatus)) {
      throw new Error("Invalid order status.");
    }

    const adminSupabase = createAdminClient();

    const { error: updateError } = await adminSupabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        order_status: orderStatus,
        internal_notes: internalNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Update order error:", updateError);
      throw new Error("Could not update the order.");
    }

    await adminSupabase.from("audit_logs").insert({
      admin_user_id: user.id,
      action: "update_order",
      entity_type: "order",
      entity_id: id,
      details: {
        payment_status: paymentStatus,
        order_status: orderStatus,
        updated_at: new Date().toISOString(),
      },
    });

    redirect(`/admin/orders/${id}`);
  }

  const address =
    typeof order.delivery_address === "object" &&
    order.delivery_address !== null
      ? order.delivery_address
      : {};

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Jeffrey Smith Used Bikes
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Order {order.order_number}
            </h1>

            <p className="mt-2 text-slate-400">
              Review customer details and update order status.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
          >
            Back to Orders
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold">
              Customer Details
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="mt-1 font-semibold">
                  {order.customer_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="mt-1 font-semibold">
                  {order.customer_email}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="mt-1 font-semibold">
                  {order.customer_phone}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Delivery Address
                </p>

                <p className="mt-1 font-semibold">
                  {address.street ?? ""}
                  <br />
                  {address.city ?? ""}, {address.state ?? ""}{" "}
                  {address.postal_code ?? ""}
                  <br />
                  {address.country ?? ""}
                </p>
              </div>

              {order.customer_message && (
                <div>
                  <p className="text-xs text-slate-500">
                    Customer Message
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-slate-300">
                    {order.customer_message}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500">
                  Amount
                </p>

                <p className="mt-1 text-2xl font-bold text-orange-400">
                  $
                  {(order.bike_price_cents / 100).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Payment Method
                </p>

                <p className="mt-1 font-semibold capitalize">
                  {order.payment_method?.replaceAll("_", " ") ??
                    "Not selected"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Created
                </p>

                <p className="mt-1 font-semibold">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        </div>

        <form
          action={updateOrder}
          className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <h2 className="text-xl font-bold">
            Update Order
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Payment Status
              </label>

              <select
                name="payment_status"
                defaultValue={order.payment_status}
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
                <option value="partially_refunded">
                  Partially Refunded
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Order Status
              </label>

              <select
                name="order_status"
                defaultValue={order.order_status}
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="pending">Pending</option>
                <option value="awaiting_payment">
                  Awaiting Payment
                </option>
                <option value="deposit_paid">
                  Deposit Paid
                </option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="ready_for_collection">
                  Ready for Collection
                </option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Internal Notes
              </label>

              <textarea
                name="internal_notes"
                rows={5}
                defaultValue={order.internal_notes ?? ""}
                placeholder="Private notes visible only to administrators"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-bold transition hover:bg-orange-400"
          >
            Save Order Changes
          </button>
        </form>
      </div>
    </main>
  );
}