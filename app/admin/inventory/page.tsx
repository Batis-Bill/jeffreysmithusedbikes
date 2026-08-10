import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function InventoryPage() {
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

  const { data: bikes, error } = await supabase
    .from("bikes")
    .select(
      "id, stock_number, make, model, model_year, price_cents, mileage, status, published, bike_images(storage_path, alt_text, display_order) "
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Inventory error:", error);
  }


  const bikesWithImages = await Promise.all(
  (bikes ?? []).map(async (bike) => {
    const firstImage = bike.bike_images
      ?.sort(
        (a, b) =>
          (a.display_order ?? 0) - (b.display_order ?? 0)
      )[0];

    let imageUrl: string | null = null;

    if (firstImage?.storage_path) {
      const { data } = await supabase.storage
        .from("bike-images")
        .createSignedUrl(firstImage.storage_path, 60 * 60);

      imageUrl = data?.signedUrl ?? null;
    }

    return {
      ...bike,
      imageUrl,
      imageAlt:
        firstImage?.alt_text ??
        `${bike.model_year} ${bike.make} ${bike.model}`,
    };
  })
);


  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Jeffrey Smith Used Bikes
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Inventory Management
            </h1>

            <p className="mt-2 text-slate-400">
              Add, edit, publish, reserve, sell, or remove motorcycles.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 flex justify-end">
          <Link
            href="/admin/inventory/new"
            className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-400"
          >
            + Add Bike
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          {bikes && bikes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-5 py-4">Image</th>
                    <th className="px-5 py-4">Stock #</th>
                    <th className="px-5 py-4">Bike</th>
                    <th className="px-5 py-4">Year</th>
                    <th className="px-5 py-4">Mileage</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Published</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {bikesWithImages.map((bike) => (
                    <tr
                      key={bike.id}
                      className="border-b border-white/5 last:border-0"
                    >

                      <td className="px-5 py-4">
                        {bike.imageUrl ? (
                            <img
                            src={bike.imageUrl}
                            alt={bike.imageAlt}
                            className="h-16 w-24 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-24 items-center justify-center rounded-xl bg-white/5 text-xs text-slate-500">
                                No image
                            </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {bike.stock_number}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {bike.make} {bike.model}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {bike.model_year}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {bike.mileage.toLocaleString()} mi
                      </td>

                      <td className="px-5 py-4 font-semibold text-orange-400">
                        ${(bike.price_cents / 100).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 capitalize">
                        {bike.status}
                      </td>

                      <td className="px-5 py-4">
                        {bike.published ? "Yes" : "No"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                            <Link
                                href={`/admin/inventory/${bike.id}/edit`}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10"
                            >
                                Edit
                            </Link>

                            <form action={`/admin/inventory/${bike.id}/delete`} method="post">
                                <button
                                    type="submit"
                                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
                                >
                                    Delete
                                </button>
                            </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <h2 className="text-xl font-bold">
                No bikes in inventory yet
              </h2>

              <p className="mt-2 text-slate-400">
                Your first motorcycle will appear here after you add it.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}