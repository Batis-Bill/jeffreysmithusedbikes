import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ShopPage() {
  const supabase = await createClient();

  const { data: bikes, error } = await supabase
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
      bike_images (
        storage_path,
        alt_text,
        display_order
      )
    `)
    .eq("published", true)
    .in("status", ["available", "reserved"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Shop inventory error:", error);
  }

  const bikesWithImages = await Promise.all(
    (bikes ?? []).map(async (bike) => {
      const firstImage = bike.bike_images
        ?.sort(
          (a, b) =>
            (a.display_order ?? 0) -
            (b.display_order ?? 0)
        )[0];

      let imageUrl: string | null = null;

      if (firstImage?.storage_path) {
        const { data } = await supabase.storage
          .from("bike-images")
          .createSignedUrl(
            firstImage.storage_path,
            60 * 60
          );

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
    <main className="min-h-screen bg-[#07111f] text-white">
      <header className="border-b border-white/10 bg-[#07111f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 font-bold">
              JS
            </div>

            <div>
              <p className="font-bold">
                Jeffrey Smith
              </p>

              <p className="text-xs text-slate-400">
                Used Bikes
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-semibold">
            <Link
              href="/"
              className="text-slate-300 hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="text-orange-400"
            >
              Shop
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            Available Inventory
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Find your next motorcycle
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Browse our currently available used motorcycles.
            View specifications, pricing, mileage, condition,
            and other important details before placing an order.
          </p>
        </div>

        {bikesWithImages.length > 0 ? (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {bikesWithImages.map((bike) => (
              <article
                key={bike.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl"
              >
                <div className="relative h-64 bg-white/5">
                  {bike.imageUrl ? (
                    <img
                      src={bike.imageUrl}
                      alt={bike.imageAlt}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      Image unavailable
                    </div>
                  )}

                  <div className="absolute left-4 top-4 rounded-full bg-[#07111f]/80 px-3 py-1 text-xs font-bold capitalize backdrop-blur">
                    {bike.status}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">
                        {bike.model_year} • {bike.bike_type}
                      </p>

                      <h2 className="mt-1 text-2xl font-bold">
                        {bike.make} {bike.model}
                      </h2>
                    </div>

                    <p className="whitespace-nowrap text-xl font-bold text-orange-400">
                      $
                      {(
                        bike.price_cents / 100
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-slate-500">
                        Mileage
                      </p>

                      <p className="mt-1 font-semibold">
                        {bike.mileage.toLocaleString()} mi
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-slate-500">
                        Engine
                      </p>

                      <p className="mt-1 font-semibold">
                        {bike.engine_capacity_cc
                          ? `${bike.engine_capacity_cc} cc`
                          : bike.fuel_type === "Electric"
                            ? "Electric"
                            : "N/A"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-slate-500">
                        Transmission
                      </p>

                      <p className="mt-1 font-semibold">
                        {bike.transmission}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-slate-500">
                        Fuel Type
                      </p>

                      <p className="mt-1 font-semibold">
                        {bike.fuel_type}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-400">
                    {bike.description}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Link
                      href={`/bikes/${bike.id}`}
                      className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:bg-white/10"
                    >
                      View Details
                    </Link>

                    <Link
                      href={`/order/${bike.id}`}
                      className="flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold transition hover:bg-orange-400"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-20 text-center">
            <h2 className="text-2xl font-bold">
              No bikes available right now
            </h2>

            <p className="mt-3 text-slate-400">
              New motorcycles will appear here when they are published.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}