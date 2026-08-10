import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function createOrder(
  bikeId: string,
  formData: FormData
) {
  "use server";

  const supabase = await createClient();

  const customerName = String(
    formData.get("customer_name") ?? ""
  ).trim();

  const customerEmail = String(
    formData.get("customer_email") ?? ""
  ).trim();

  const customerPhone = String(
    formData.get("customer_phone") ?? ""
  ).trim();

  const street = String(
    formData.get("street") ?? ""
  ).trim();

  const city = String(
    formData.get("city") ?? ""
  ).trim();

  const state = String(
    formData.get("state") ?? ""
  ).trim();

  const postalCode = String(
    formData.get("postal_code") ?? ""
  ).trim();

  const country = String(
    formData.get("country") ?? ""
  ).trim();

  const paymentMethod = String(
    formData.get("payment_method") ?? ""
  ).trim();

  const customerMessage = String(
    formData.get("customer_message") ?? ""
  ).trim();

  if (
    !bikeId ||
    !customerName ||
    !customerEmail ||
    !customerPhone ||
    !street ||
    !city ||
    !state ||
    !postalCode ||
    !country ||
    !paymentMethod
  ) {
    throw new Error("Missing required order information.");
  }

  const allowedPaymentMethods = [
    "zelle",
    "cash_app",
    "apple_pay",
    "chime",
    "apple_gift_card",
  ];

  if (!allowedPaymentMethods.includes(paymentMethod)) {
    throw new Error("Invalid payment method.");
  }

  const { data: bike, error: bikeError } = await supabase
    .from("bikes")
    .select(`
      id,
      make,
      model,
      model_year,
      price_cents,
      deposit_cents,
      status,
      published
    `)
    .eq("id", bikeId)
    .eq("published", true)
    .single();

  if (
    bikeError ||
    !bike ||
    !["available", "reserved"].includes(bike.status)
  ) {
    throw new Error("This motorcycle is not available.");
  }

  const orderNumber =
    `JSB-${Date.now()}-${crypto.randomUUID()
      .slice(0, 6)
      .toUpperCase()}`;

  const adminSupabase = createAdminClient();

  const { data: order, error: orderError } =
    await adminSupabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        bike_id: bike.id,

        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,

        delivery_address: {
          street,
          city,
          state,
          postal_code: postalCode,
          country,
        },

        bike_price_cents: bike.price_cents,
        deposit_amount_cents:
          bike.deposit_cents ?? 0,

        currency: "usd",

        // This is only the customer's preferred method.
        // No payment account is connected here.
        payment_method: paymentMethod,

        payment_status: "pending",
        order_status: "awaiting_payment",

        customer_message:
          customerMessage || null,
      })
      .select("id, order_number")
      .single();

  if (orderError || !order) {
    console.error(
      "Create order error:",
      orderError
    );

    throw new Error(
      "Could not create the order."
    );
  }

  // No payment processing.
  // Customer simply goes to the confirmation page.
  redirect(
    `/order/${bike.id}/confirmation?order=${order.id}`
  );
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: bike, error } = await supabase
    .from("bikes")
    .select(`
      id,
      stock_number,
      make,
      model,
      model_year,
      price_cents,
      mileage,
      engine_capacity_cc,
      transmission,
      fuel_type,
      bike_type,
      condition,
      description,
      status,
      published
    `)
    .eq("id", id)
    .eq("published", true)
    .single();

  if (
    error ||
    !bike ||
    !["available", "reserved"].includes(
      bike.status
    )
  ) {
    notFound();
  }

  const createOrderWithBikeId =
    createOrder.bind(null, bike.id);

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-bold"
          >
            Jeffrey Smith Used Bikes
          </Link>

          <Link
            href={`/bikes/${bike.id}`}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Back to Bike
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* TITLE */}
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
            Order Request
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            {bike.model_year} {bike.make}{" "}
            {bike.model}
          </h1>

          <p className="mt-4 text-slate-400">
            Complete the form below to submit
            your order request.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          {/* BIKE SUMMARY */}
          <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Motorcycle
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {bike.make} {bike.model}
            </h2>

            <p className="mt-1 text-slate-400">
              {bike.model_year}
            </p>

            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-sm text-slate-500">
                Listed Price
              </p>

              <p className="mt-1 text-3xl font-bold text-orange-400">
                $
                {(
                  bike.price_cents / 100
                ).toLocaleString("en-US")}
              </p>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              {bike.mileage != null && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Mileage
                  </span>

                  <span>
                    {bike.mileage.toLocaleString()}{" "}
                    miles
                  </span>
                </div>
              )}

              {bike.engine_capacity_cc != null && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Engine
                  </span>

                  <span>
                    {bike.engine_capacity_cc} cc
                  </span>
                </div>
              )}

              {bike.transmission && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Transmission
                  </span>

                  <span>
                    {bike.transmission}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Status
                </span>

                <span className="capitalize">
                  {bike.status}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Stock #
                </span>

                <span>
                  {bike.stock_number}
                </span>
              </div>
            </div>
          </aside>

          {/* ORDER FORM */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <h2 className="text-2xl font-bold">
              Customer Information
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Submitting this form creates an
              order request. It does not charge
              you or automatically complete a
              payment.
            </p>

            <form
              action={createOrderWithBikeId}
              className="mt-8 space-y-8"
            >
              {/* CONTACT */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Full Name
                  </label>

                  <input
                    name="customer_name"
                    required
                    autoComplete="name"
                    className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none transition focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email
                  </label>

                  <input
                    type="email"
                    name="customer_email"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none transition focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    autoComplete="tel"
                    className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none transition focus:border-orange-500"
                  />
                </div>
              </div>

              {/* ADDRESS */}
              <div>
                <h3 className="text-lg font-bold">
                  Address
                </h3>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold">
                      Street Address
                    </label>

                    <input
                      name="street"
                      required
                      autoComplete="street-address"
                      className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none transition focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      City
                    </label>

                    <input
                      name="city"
                      required
                      autoComplete="address-level2"
                      className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none transition focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      State / Province
                    </label>

                    <input
                      name="state"
                      required
                      autoComplete="address-level1"
                      className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none transition focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      ZIP / Postal Code
                    </label>

                    <input
                      name="postal_code"
                      required
                      autoComplete="postal-code"
                      className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none transition focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Country
                    </label>

                    <select
                      name="country"
                      defaultValue="US"
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
                    >
                      <option value="US">
                        United States
                      </option>

                      <option value="CA">
                        Canada
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PAYMENT PREFERENCE */}
              <div>
                <h3 className="text-lg font-bold">
                  Preferred Payment Method
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  This selection is for the
                  order request only. No payment
                  account is connected to this
                  website and no payment is
                  collected when you submit the
                  form.
                </p>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold">
                    Payment Method
                  </label>

                  <select
                    name="payment_method"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
                  >
                    <option value="" disabled>
                      Select a payment method
                    </option>

                    <option value="zelle">
                      Zelle
                    </option>

                    <option value="cash_app">
                      Cash App
                    </option>

                    <option value="apple_pay">
                      Apple Pay
                    </option>

                    <option value="chime">
                      Chime
                    </option>

                    <option value="apple_gift_card">
                      Apple Gift Card
                    </option>
                  </select>
                </div>

                <div className="mt-5 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                  <p className="text-sm leading-6 text-slate-300">
                    <strong className="text-white">
                      Important:
                    </strong>{" "}
                    submitting an order does not
                    mean the motorcycle has been
                    paid for. Never send payment
                    solely because you reached a
                    confirmation page. Payment
                    arrangements should be
                    independently confirmed.
                  </p>
                </div>
              </div>

              {/* MESSAGE */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Message or Special Request
                </label>

                <textarea
                  name="customer_message"
                  rows={5}
                  placeholder="Optional message about the motorcycle or your order..."
                  className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none transition focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-orange-500 px-6 py-4 font-bold transition hover:bg-orange-400"
              >
                Submit Order Request
              </button>

              <p className="text-center text-xs leading-5 text-slate-500">
                No money is collected by this
                form.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}