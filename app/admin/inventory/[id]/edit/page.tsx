import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function EditBikePage({
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

  const { data: bike } = await supabase
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
    .single();

  if (!bike) {
    redirect("/admin/inventory");
  }

  async function updateBike(formData: FormData) {
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

    const make = String(formData.get("make") ?? "").trim();
    const model = String(formData.get("model") ?? "").trim();
    const stockNumber = String(
      formData.get("stock_number") ?? ""
    ).trim();

    const modelYear = Number(formData.get("model_year"));
    const price = Number(formData.get("price"));
    const mileage = Number(formData.get("mileage"));

    const engineCapacityRaw = formData.get("engine_capacity_cc");

    const engineCapacity =
      engineCapacityRaw &&
      String(engineCapacityRaw).trim() !== ""
        ? Number(engineCapacityRaw)
        : null;

    const transmission = String(
      formData.get("transmission") ?? ""
    ).trim();

    const fuelType = String(
      formData.get("fuel_type") ?? ""
    ).trim();

    const bikeType = String(
      formData.get("bike_type") ?? ""
    ).trim();

    const condition = String(
      formData.get("condition") ?? ""
    ).trim();

    const description = String(
      formData.get("description") ?? ""
    ).trim();

    const status = String(
      formData.get("status") ?? "draft"
    );

    const published =
      formData.get("published") === "on";

    const { error } = await supabase
      .from("bikes")
      .update({
        stock_number: stockNumber,
        make,
        model,
        model_year: modelYear,
        price_cents: Math.round(price * 100),
        mileage,
        engine_capacity_cc: engineCapacity,
        transmission,
        fuel_type: fuelType,
        bike_type: bikeType,
        condition,
        description,
        status,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Update bike error:", error);
      throw new Error("Could not update the bike.");
    }

    await supabase.from("audit_logs").insert({
      admin_user_id: user.id,
      action: "update_bike",
      entity_type: "bike",
      entity_id: id,
      details: {
        updated_at: new Date().toISOString(),
      },
    });

    redirect("/admin/inventory");
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            Jeffrey Smith Used Bikes
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Edit Bike
          </h1>

          <p className="mt-2 text-slate-400">
            Update the motorcycle listing below.
          </p>
        </div>

        <form
          action={updateBike}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Stock Number
              </label>

              <input
                name="stock_number"
                defaultValue={bike.stock_number}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Make
              </label>

              <input
                name="make"
                defaultValue={bike.make}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Model
              </label>

              <input
                name="model"
                defaultValue={bike.model}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Year
              </label>

              <input
                name="model_year"
                type="number"
                min="1900"
                max="2100"
                defaultValue={bike.model_year}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Price ($)
              </label>

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={bike.price_cents / 100}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Mileage
              </label>

              <input
                name="mileage"
                type="number"
                min="0"
                defaultValue={bike.mileage}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Engine Capacity (cc)
              </label>

              <input
                name="engine_capacity_cc"
                type="number"
                min="0"
                defaultValue={bike.engine_capacity_cc ?? ""}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Transmission
              </label>

              <select
                name="transmission"
                defaultValue={bike.transmission}
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="Semi-Automatic">
                  Semi-Automatic
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Fuel Type
              </label>

              <select
                name="fuel_type"
                defaultValue={bike.fuel_type}
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="Gasoline">Gasoline</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Bike Type
              </label>

              <select
                name="bike_type"
                defaultValue={bike.bike_type}
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="Sport">Sport</option>
                <option value="Cruiser">Cruiser</option>
                <option value="Scooter">Scooter</option>
                <option value="Touring">Touring</option>
                <option value="Adventure">Adventure</option>
                <option value="Dirt Bike">Dirt Bike</option>
                <option value="Standard">Standard</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Condition
              </label>

              <select
                name="condition"
                defaultValue={bike.condition}
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Status
              </label>

              <select
                name="status"
                defaultValue={bike.status}
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="draft">Draft</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                name="description"
                rows={6}
                defaultValue={bike.description}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <input
              id="published"
              name="published"
              type="checkbox"
              defaultChecked={bike.published}
              className="h-5 w-5"
            />

            <label htmlFor="published">
              Publish this bike
            </label>
          </div>

          <button
            type="submit"
            className="mt-8 rounded-xl bg-orange-500 px-6 py-3 font-bold transition hover:bg-orange-400"
          >
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}