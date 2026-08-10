import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BikeDetailsPage({
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
      published,
      bike_images (
        storage_path,
        alt_text,
        display_order
      )
    `)
    .eq("id", id)
    .eq("published", true)
    .single();

  if (error || !bike) {
    notFound();
  }

  const sortedImages =
    bike.bike_images?.sort(
      (a, b) =>
        (a.display_order ?? 0) -
        (b.display_order ?? 0)
    ) ?? [];

  const imageUrls = await Promise.all(
    sortedImages.map(async (image) => {
      const { data } = await supabase.storage
        .from("bike-images")
        .createSignedUrl(
          image.storage_path,
          60 * 60
        );

      return {
        url: data?.signedUrl ?? null,
        alt:
          image.alt_text ??
          `${bike.model_year} ${bike.make} ${bike.model}`,
      };
    })
  );

  const validImages = imageUrls.filter(
    (image) => image.url
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

          <Link
            href="/shop"
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            Back to Shop
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            {validImages.length > 0 ? (
              <div className="space-y-4">
                <img
                  src={validImages[0].url!}
                  alt={validImages[0].alt}
                  className="h-[420px] w-full rounded-3xl object-cover"
                />

                {validImages.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {validImages
                      .slice(1, 4)
                      .map((image, index) => (
                        <img
                          key={index}
                          src={image.url!}
                          alt={image.alt}
                          className="h-32 w-full rounded-2xl object-cover"
                        />
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-500">
                Image unavailable
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              {bike.status}
            </p>

            <h1 className="mt-3 text-4xl font-bold md:text-5xl">
              {bike.model_year} {bike.make} {bike.model}
            </h1>

            <p className="mt-4 text-3xl font-bold text-orange-400">
              $
              {(bike.price_cents / 100).toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }
              )}
            </p>

            <p className="mt-6 text-slate-400">
              {bike.description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Stock Number
                </p>

                <p className="mt-1 font-semibold">
                  {bike.stock_number}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Mileage
                </p>

                <p className="mt-1 font-semibold">
                  {bike.mileage.toLocaleString()} miles
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Engine
                </p>

                <p className="mt-1 font-semibold">
                  {bike.engine_capacity_cc
                    ? `${bike.engine_capacity_cc} cc`
                    : bike.fuel_type === "Electric"
                      ? "Electric motor"
                      : "N/A"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Transmission
                </p>

                <p className="mt-1 font-semibold">
                  {bike.transmission}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Fuel Type
                </p>

                <p className="mt-1 font-semibold">
                  {bike.fuel_type}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Condition
                </p>

                <p className="mt-1 font-semibold">
                  {bike.condition}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Type
                </p>

                <p className="mt-1 font-semibold">
                  {bike.bike_type}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Year
                </p>

                <p className="mt-1 font-semibold">
                  {bike.model_year}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/order/${bike.id}`}
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-400"
              >
                Order Now
              </Link>

              <Link
                href="/shop"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}