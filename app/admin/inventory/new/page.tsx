import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function createBike(formData: FormData) {
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

  const stockNumber = String(formData.get("stock_number") ?? "").trim();
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const transmission = String(formData.get("transmission") ?? "").trim();
  const fuelType = String(formData.get("fuel_type") ?? "").trim();
  const bikeType = String(formData.get("bike_type") ?? "").trim();
  const condition = String(formData.get("condition") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");

  const modelYear = Number(formData.get("model_year"));
  const price = Number(formData.get("price"));
  const mileage = Number(formData.get("mileage"));
  const engineCapacityRaw = formData.get("engine_capacity_cc");
  const published = formData.get("published") === "on";

  const engineCapacity =
    engineCapacityRaw && String(engineCapacityRaw).trim() !== ""
      ? Number(engineCapacityRaw)
      : null;

  if (
    !stockNumber ||
    !make ||
    !model ||
    !transmission ||
    !fuelType ||
    !bikeType ||
    !condition ||
    !description
  ) {
    throw new Error("Missing required bike information.");
  }

  if (
    !Number.isInteger(modelYear) ||
    modelYear < 1900 ||
    modelYear > 2100
  ) {
    throw new Error("Invalid model year.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Invalid price.");
  }

  if (!Number.isInteger(mileage) || mileage < 0) {
    throw new Error("Invalid mileage.");
  }

  if (
    engineCapacity !== null &&
    (!Number.isInteger(engineCapacity) || engineCapacity < 0)
  ) {
    throw new Error("Invalid engine capacity.");
  }

  const allowedStatuses = [
    "draft",
    "available",
    "reserved",
    "sold",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid bike status.");
  }

  const priceCents = Math.round(price * 100);

  const { data: newBike, error: bikeError } = await supabase
  .from("bikes")
  .insert({
    stock_number: stockNumber,
    make,
    model,
    model_year: modelYear,
    price_cents: priceCents,
    mileage,
    engine_capacity_cc: engineCapacity,
    transmission,
    fuel_type: fuelType,
    bike_type: bikeType,
    condition,
    description,
    status,
    published,
    created_by: user.id,
  })
  .select("id")
  .single();

if (bikeError || !newBike) {
  console.error("Create bike error:", bikeError);
  throw new Error("Could not save the bike.");
}

const imageFile = formData.get("bike_image");

if (!(imageFile instanceof File) || imageFile.size === 0) {
  throw new Error("A bike image is required.");
}

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

if (!allowedImageTypes.includes(imageFile.type)) {
  throw new Error("Only JPG, PNG, and WebP images are allowed.");
}

const maxImageSize = 8 * 1024 * 1024;

if (imageFile.size > maxImageSize) {
  throw new Error("Image must be smaller than 8 MB.");
}

const fileExtension =
  imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

const imagePath =
  `${newBike.id}/${crypto.randomUUID()}.${fileExtension}`;

const { error: uploadError } = await supabase.storage
  .from("bike-images")
  .upload(imagePath, imageFile, {
    contentType: imageFile.type,
    upsert: false,
  });

if (uploadError) {
  console.error("Image upload error:", uploadError);

  await supabase
    .from("bikes")
    .delete()
    .eq("id", newBike.id);

  throw new Error("Could not upload the bike image.");
}

const { error: imageRecordError } = await supabase
  .from("bike_images")
  .insert({
    bike_id: newBike.id,
    storage_path: imagePath,
    alt_text: `${modelYear} ${make} ${model}`,
    display_order: 0,
  });

if (imageRecordError) {
  console.error("Image record error:", imageRecordError);

  await supabase.storage
    .from("bike-images")
    .remove([imagePath]);

  await supabase
    .from("bikes")
    .delete()
    .eq("id", newBike.id);

  throw new Error("Could not save the bike image information.");
}

  redirect("/admin/inventory");
}


export default async function NewBikePage() {
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

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            Jeffrey Smith Used Bikes
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Add New Bike
          </h1>

          <p className="mt-2 text-slate-400">
            Enter the motorcycle details below.
          </p>
        </div>

        <form action={createBike}
        className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="grid gap-6 md:grid-cols-2">

                <div>
                    <label className="mb-2 block text-sm font-semibold">
                        Stock Number
                    </label>
                    <input
                        name="stock_number"
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
                        required
                        placeholder="Honda"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold">
                        Model
                    </label>
                    <input
                        name="model"
                        required
                        placeholder="CBR600RR"
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
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold">
                        Transmission
                    </label>
                    <select
                        name="transmission"
                        required
                        className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">Select</option>
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Semi-Automatic">Semi-Automatic</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold">
                        Fuel Type
                    </label>
                    <select
                        name="fuel_type"
                        required
                        className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">Select</option>
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
                        required
                        className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">Select</option>
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
                        required
                        className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">Select</option>
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
                        defaultValue="draft"
                        className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="draft">Draft</option>
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold">
                        Description
                    </label>
                    <textarea
                        name="description"
                        required
                        rows={6}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

            </div>

            <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                    Bike Image
                </label>

                <input
                    name="bike_image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300 outline-none focus:border-orange-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                    Upload a JPG, PNG, or WebP image.
                </p>
            </div>


            <div className="mt-8 flex items-center gap-3">
                <input
                    id="published"
                    name="published"
                    type="checkbox"
                    className="h-5 w-5"
                />
                <label htmlFor="published">
                    Publish this bike immediately
                </label>
            </div>

            <button
                type="submit"
                className="mt-8 rounded-xl bg-orange-500 px-6 py-3 font-bold transition hover:bg-orange-400"
            >
                Save Bike
            </button>
        </form>
      </div>
    </main>
  );
}